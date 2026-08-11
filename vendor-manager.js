/* IVIP Vendor Manager - FINAL
   Add Vendor + Vendor List + KPI synchronization
   Matched to the current index.html IDs.
*/
(function () {
  "use strict";

  const STORAGE_KEY = "ivip_vendors";
  let vendors = loadVendors();
  let selectedVendorIndex = null;

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

  function saveVendors() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vendors));
    window.dispatchEvent(new CustomEvent("ivip:vendorsUpdated", {
      detail: { count: vendors.length, vendors: vendors }
    }));
  }

  function updateKPI() {
    const total = document.getElementById("totalVendor");
    const pending = document.getElementById("pendingVendor");
    const approved = document.getElementById("approvedVendor");
    const surveyTotal = document.getElementById("surveyTotal");
    const surveyPending = document.getElementById("surveyPending");
    const surveyApproved = document.getElementById("surveyApproved");

    const pendingCount = vendors.filter(v =>
      String(v.status || v.approval || "").toLowerCase() === "pending"
    ).length;

    const approvedCount = vendors.filter(v =>
      String(v.status || v.approval || "").toLowerCase() === "approved"
    ).length;

    if (total) total.textContent = String(vendors.length);
    if (pending) pending.textContent = String(pendingCount);
    if (approved) approved.textContent = String(approvedCount);
    if (surveyTotal) surveyTotal.textContent = String(vendors.length);
    if (surveyPending) surveyPending.textContent = String(pendingCount);
    if (surveyApproved) surveyApproved.textContent = String(approvedCount);

    const percent = document.getElementById("surveyApprovalPercent");
    if (percent) {
      percent.textContent = vendors.length
        ? Math.round((approvedCount / vendors.length) * 100) + "%"
        : "0%";
    }
  }

  function renderVendors() {
    // Current index.html uses <tbody id="vendorTable">.
    const tbody =
      document.getElementById("vendorTable") ||
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
        <td>${escapeHtml(vendor.documents || "0 / 3")}</td>
        <td>${escapeHtml(vendor.status || vendor.approval || "Pending")}</td>
        <td>${escapeHtml(vendor.lastUpdate || "")}</td>
        <td>
          <button type="button" class="vendor-action" data-index="${index}" data-action="view">View</button>
          <button type="button" class="vendor-action" data-index="${index}" data-action="delete">Delete</button>
        </td>
      `;

      tbody.appendChild(row);
    });

    tbody.querySelectorAll(".vendor-action").forEach(btn => {
      btn.addEventListener("click", function () {
        const index = Number(this.dataset.index);
        if (!Number.isInteger(index) || !vendors[index]) return;

        if (this.dataset.action === "delete") {
          if (!confirm("Delete this vendor?")) return;

          vendors.splice(index, 1);
          selectedVendorIndex = null;
          saveVendors();
          renderVendors();
          updateKPI();
          return;
        }

        selectedVendorIndex = index;
        fillDetail(vendors[index]);
      });
    });

    updateKPI();
  }

  function addVendor() {
    const name = valueOf("vendorCompany");
    const category = valueOf("vendorCategory");
    const city = valueOf("vendorCity");
    const contact = valueOf("vendorContact");
    const phone = valueOf("vendorPhone");
    const email = valueOf("vendorEmail");
    const website = valueOf("vendorWebsite");
    const status = valueOf("vendorStatus") || "Pending";

    if (!name) {
      alert("Please enter Company Name.");
      document.getElementById("vendorCompany")?.focus();
      return;
    }

    const today = new Date().toISOString().slice(0, 10);

    vendors.push({
      id: "V" + String(Date.now()).slice(-8),
      name: name,
      category: category,
      city: city,
      location: city,
      contact: contact,
      phone: phone,
      email: email,
      website: website,
      status: status,
      approval: status,
      score: 0,
      documents: "0 / 3",
      lastUpdate: today
    });

    saveVendors();
    renderVendors();
    updateKPI();
    clearAddForm();
    closeModal();

    console.log("IVIP: Vendor added:", name);
  }

  function openModal() {
    const modal = document.getElementById("vendorModal");
    if (!modal) return;

    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");

    const title = document.getElementById("vendorModalTitle");
    if (title) title.textContent = "Add Vendor";

    const company = document.getElementById("vendorCompany");
    if (company) setTimeout(() => company.focus(), 50);
  }

  function closeModal() {
    const modal = document.getElementById("vendorModal");
    if (!modal) return;

    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
  }

  function bindModalAndAddButtons() {
    const addBtn = document.getElementById("addVendorBtn");
    const saveBtn = document.getElementById("saveVendor");
    const closeBtn = document.getElementById("closeModal");
    const cancelBtn = document.getElementById("closeModalBottom");
    const modal = document.getElementById("vendorModal");

    if (addBtn && !addBtn.dataset.ivipBound) {
      addBtn.addEventListener("click", openModal);
      addBtn.dataset.ivipBound = "1";
    }

    if (saveBtn && !saveBtn.dataset.ivipBound) {
      saveBtn.addEventListener("click", addVendor);
      saveBtn.dataset.ivipBound = "1";
    }

    if (closeBtn && !closeBtn.dataset.ivipBound) {
      closeBtn.addEventListener("click", closeModal);
      closeBtn.dataset.ivipBound = "1";
    }

    if (cancelBtn && !cancelBtn.dataset.ivipBound) {
      cancelBtn.addEventListener("click", closeModal);
      cancelBtn.dataset.ivipBound = "1";
    }

    if (modal && !modal.dataset.ivipBound) {
      modal.addEventListener("click", function (e) {
        if (e.target === modal) closeModal();
      });
      modal.dataset.ivipBound = "1";
    }
  }

  function fillDetail(v) {
    setValue("detailCompany", v.name);
    setValue("detailCategory", v.category);
    setValue("detailCity", v.city || v.location);
    setValue("detailStatus", v.status || v.approval || "Pending");
    setValue("detailContact", v.contact);
    setValue("detailPhone", v.phone);
    setValue("detailEmail", v.email);
    setValue("detailWebsite", v.website);
    setValue("detailRemarks", v.remarks);
  }

  function clearAddForm() {
    [
      "vendorCompany",
      "vendorCategory",
      "vendorCity",
      "vendorContact",
      "vendorPhone",
      "vendorEmail",
      "vendorWebsite"
    ].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });

    const status = document.getElementById("vendorStatus");
    if (status) status.value = "Pending";
  }

  function valueOf(id) {
    const el = document.getElementById(id);
    return el ? String(el.value || "").trim() : "";
  }

  function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value ?? "";
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function init() {
    bindModalAndAddButtons();
    renderVendors();
    updateKPI();

    // Re-bind only if the dashboard creates/replaces the modal/button later.
    const observer = new MutationObserver(function () {
      bindModalAndAddButtons();
    });

    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }

    console.log("IVIP Vendor Manager Loaded - FINAL");
  }

  window.ivipVendorManager = {
    getVendors: () => vendors,
    addVendor: addVendor,
    openModal: openModal,
    closeModal: closeModal,
    renderVendors: renderVendors,
    updateKPI: updateKPI
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
