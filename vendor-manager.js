/* IVIP Vendor Manager - KPI Connected
   Add Vendor + Vendor List + KPI synchronization
*/
(function () {
  "use strict";

  const STORAGE_KEY = "ivip_vendors";

  function loadVendors() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("IVIP: failed to load vendors", e);
    }
    return [];
  }

  let vendors = loadVendors();
  let selectedVendorIndex = null;

  function saveVendors() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vendors));
  }

  function updateKPI() {
    const count = vendors.length;

    // Primary KPI IDs used by the IVIP dashboard.
    const totalIds = [
      "totalVendor",
      "totalVendors",
      "totalVendorCount"
    ];

    let updated = false;

    totalIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = String(count);
        updated = true;
      }
    });

    // Fallback: find the KPI card by its visible "Total Vendors" label.
    // This avoids depending on a particular ID in the HTML.
    if (!updated) {
      const labels = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6,span,p,div"));
      const label = labels.find(el =>
        el.children.length === 0 &&
        el.textContent.trim().toLowerCase() === "total vendors"
      );

      if (label) {
        const card = label.closest(".card,.kpi-card,.stat-card,.metric-card") || label.parentElement;
        if (card) {
          const value =
            card.querySelector("#totalVendor,#totalVendors,#totalVendorCount") ||
            card.querySelector("h1,h2,h3,.value,.number,.count");

          if (value && value !== label) {
            value.textContent = String(count);
            updated = true;
          }
        }
      }
    }

    // Keep the other KPI values synchronized when those elements exist.
    const approved = document.getElementById("approvedVendor");
    if (approved) {
      approved.textContent = String(
        vendors.filter(v =>
          String(v.status || v.approval || "").toLowerCase() === "approved"
        ).length
      );
    }

    const pending = document.getElementById("pendingVendor");
    if (pending) {
      pending.textContent = String(
        vendors.filter(v =>
          String(v.status || v.approval || "").toLowerCase() === "pending"
        ).length
      );
    }

    // Tell the rest of the dashboard that the vendor count changed.
    window.dispatchEvent(new CustomEvent("ivip:vendorsUpdated", {
      detail: { count: count, vendors: vendors }
    }));
  }

  function renderVendors() {
    const tbody =
      document.getElementById("vendorTableBody") ||
      document.querySelector("#vendorTable tbody") ||
      document.querySelector(".vendor-table tbody");

    if (!tbody) {
      updateKPI();
      return;
    }

    tbody.innerHTML = "";

    vendors.forEach((vendor, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${escapeHtml(vendor.name || "")}</td>
        <td>${escapeHtml(vendor.category || "")}</td>
        <td>${escapeHtml(vendor.city || vendor.location || "")}</td>
        <td>${escapeHtml(vendor.status || vendor.approval || "Pending")}</td>
        <td>${escapeHtml(vendor.score ?? "")}</td>
        <td>${escapeHtml(vendor.lastUpdate || "")}</td>
        <td>
          <button type="button" class="vendor-action" data-index="${index}" data-action="view">View</button>
          <button type="button" class="vendor-action" data-index="${index}" data-action="delete">Delete</button>
        </td>`;
      tbody.appendChild(row);
    });

    tbody.querySelectorAll(".vendor-action").forEach(btn => {
      btn.addEventListener("click", function () {
        const index = Number(this.dataset.index);
        if (this.dataset.action === "delete") {
          if (!confirm("Delete this vendor?")) return;
          vendors.splice(index, 1);
          saveVendors();
          renderVendors();
          updateKPI();
        } else {
          selectedVendorIndex = index;
          fillDetail(vendors[index]);
        }
      });
    });

    updateKPI();
  }

  function addVendor() {
    const name =
      valueOf("vendorCompany") ||
      valueOf("detailCompany") ||
      valueOf("vendorName");

    const category = valueOf("vendorCategory") || valueOf("detailCategory");
    const city = valueOf("vendorCity") || valueOf("detailCity");
    const score = valueOf("vendorScore") || valueOf("detailScore");

    if (!name) {
      alert("Please enter Company Name.");
      return;
    }

    vendors.push({
      id: "V" + String(Date.now()).slice(-6),
      name,
      category,
      city,
      location: city,
      status: "Pending",
      approval: "Pending",
      score: score || 0,
      lastUpdate: new Date().toISOString().slice(0, 10)
    });

    saveVendors();
    renderVendors();
    updateKPI();
    clearAddForm();

    const modal = document.getElementById("addVendorModal");
    if (modal) modal.style.display = "none";
  }

  function fillDetail(v) {
    setValue("detailCompany", v.name);
    setValue("detailCategory", v.category);
    setValue("detailCity", v.city || v.location);
    setValue("detailScore", v.score);
  }

  function clearAddForm() {
    ["vendorCompany", "vendorCategory", "vendorCity", "vendorScore"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
  }

  function valueOf(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value ?? "";
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function bindAddButton() {
    const candidates = [
      "addVendorBtn",
      "saveVendorBtn",
      "addVendorSubmit",
      "confirmAddVendor"
    ];

    for (const id of candidates) {
      const btn = document.getElementById(id);
      if (btn && !btn.dataset.ivipVendorBound) {
        btn.addEventListener("click", addVendor);
        btn.dataset.ivipVendorBound = "1";
        return;
      }
    }
  }

  function init() {
    bindAddButton();
    renderVendors();
    updateKPI();

    // Catch buttons/modal elements created after page load.
    const observer = new MutationObserver(() => {
      bindAddButton();
      updateKPI();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    console.log("IVIP Vendor Manager Loaded - KPI Connected");
  }

  window.ivipVendorManager = {
    getVendors: () => vendors,
    addVendor,
    renderVendors,
    updateKPI
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
