console.log("vendor-manager.js Loaded");
// ============================================
// Iraq Vendor Intelligence Platform
// Vendor Management Engine V1
// File: vendor-manager.js
// ============================================


// Vendor Database
const savedVendors = localStorage.getItem("vendors");
let selectedVendorIndex = null;
let vendors = savedVendors
    ? JSON.parse(savedVendors)
    : [

    {
        id: "V001",
        name: "ABC Electrical Trading",
        category: "Electrical",
        location: "Baghdad",
            contact: "Ahmed Ali",
    phone: "+964-770-123-4567",
    email: "info@abcelec.iq",
    website: "www.abcelec.iq",
        approval: "Approved",
        

        lastUpdate: "2026-07-26"
    },


    {
        id: "V002",
        name: "XYZ Mechanical Supplier",
        category: "Mechanical",
        location: "Basra",
            contact: "Ahmed Ali",
    phone: "+964-770-123-4567",
    email: "info@abcelec.iq",
    website: "www.abcelec.iq",
        approval: "Pending",
        risk: "Medium",

        lastUpdate: "2026-07-26"
    },


    {
        id: "V003",
        name: "Iraq Steel Company",
        category: "Material",
        location: "Najaf",
            contact: "Ahmed Ali",
    phone: "+964-770-123-4567",
    email: "info@abcelec.iq",
    website: "www.abcelec.iq",
        approval: "Approved",
        risk: "High",

        lastUpdate: "2026-07-26"
    }

];



// ============================================
// Search Vendor
// ============================================

const companySearch = document.getElementById("companySearch");

if (companySearch) {

    companySearch.addEventListener("input", function (e) {

        const keyword = e.target.value.trim().toLowerCase();

        if (keyword === "") {
            renderVendorTable(vendors);
            return;
        }

        const filtered = vendors.filter(v =>

            (v.name || "").toLowerCase().includes(keyword) ||
            (v.category || "").toLowerCase().includes(keyword) ||
            (v.location || "").toLowerCase().includes(keyword) ||
            (v.approval || "").toLowerCase().includes(keyword) ||
            (v.contact || "").toLowerCase().includes(keyword)

        );

        renderVendorTable(filtered);

    });

}



// ============================================
// Category Filter
// ============================================

function filterCategory(category) {

    if(category === "ALL") {
        return vendors;
    }


    return vendors.filter(v =>
        v.category === category
    );

}





// ============================================
// Approval Filter
// ============================================

function filterApproval(status) {

    if(status === "ALL") {
        return vendors;
    }


    return vendors.filter(v =>
        v.approval === status
    );

}



// ============================================
// Dashboard KPI
// ============================================

function vendorKPI() {

    return {

        total:
            vendors.length,


        approved:
            vendors.filter(
                v => v.approval === "Approved"
            ).length,


        pending:
            vendors.filter(
                v => v.approval === "Pending"
            ).length,



    };

}



// ============================================
// Render Vendor Table
// ============================================

function renderVendorTable(data){

    const tbody = document.getElementById("vendorTable");

    if(!tbody) return;

    tbody.innerHTML = "";

    data.forEach((v,index)=>{

    const row=document.createElement("tr");
const docs = v.documents || {};

let documentCount = 0;

if (docs.companyProfile) documentCount++;
if (docs.isoCertificate) documentCount++;
if (docs.companyRegistration) documentCount++;
    row.innerHTML=`
       <td>${v.name}</td>

<td>${v.category}</td>

<td>${v.location}</td>

<td>
    <span class="doc-badge">
        ${documentCount}/3
    </span>
</td>

<td>
    <span class="status ${v.approval.toLowerCase()}">
        ${v.approval}
    </span>
</td>

<td>${v.lastUpdate || "-"}</td>

<td>

<button class="view-btn"
onclick="showVendorDetail(${index})">
View
</button>

<button class="edit-btn"
onclick="editVendor(${index})">
Edit
</button>

<button class="delete-btn"
onclick="deleteVendor(${index})">
Delete
</button>

</td>
`;

    tbody.appendChild(row);

});

    // KPI 자동 갱신
    if(typeof updateVendorKPI==="function"){
        updateVendorKPI();
    }

}



// ============================================
// Initial Load
// ============================================

document.addEventListener("DOMContentLoaded", function () {

    // Vendor 목록 표시
    renderVendorTable(vendors);

    updateDashboard();

    // KPI 갱신 (script.js에 함수가 있으면 실행)
    if (typeof updateVendorKPI === "function") {
        updateVendorKPI();
    }
    if (typeof updateSurveyChart === "function") {
    updateSurveyChart();
}
if (typeof updateCategoryChart === "function") {
    updateCategoryChart();
}
    if (typeof updateRecentCompanies === "function") {
    updateRecentCompanies();
}
});
/* ==========================================
   Vendor Modal
========================================== */
let editIndex = -1;
const modal = document.getElementById("vendorModal");

const vendorAddBtn = document.getElementById("addVendorBtn");

const closeModal = document.getElementById("closeModal");

const saveVendor = document.getElementById("saveVendor");

/* Open */

if (vendorAddBtn) {
    vendorAddBtn.addEventListener("click", () => {
        modal.style.display = "flex";
    });
}

/* Close */

if (closeModal) {
    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });
}

/* Close when clicking outside */

window.addEventListener("click", (e) => {

    if(e.target === modal){

        modal.style.display = "none";

    }

});

/* Save */

saveVendor.addEventListener("click", () => {

    const company = document.getElementById("vendorCompany").value.trim();
    const category = document.getElementById("vendorCategory").value.trim();
    const city = document.getElementById("vendorCity").value.trim();

    const status = document.getElementById("vendorStatus").value;
    const contact = document.getElementById("vendorContact").value.trim();
    const phone = document.getElementById("vendorPhone").value.trim();
const email = document.getElementById("vendorEmail").value.trim();
const website = document.getElementById("vendorWebsite").value.trim();

if(company===""){
    alert("Company Name is required.");
    return;
}
const duplicate = vendors.find((v, i) =>
    i !== editIndex &&
    (v.name || "").trim().toLowerCase() === company.toLowerCase()
);

if (duplicate) {
    alert("This company is already registered.");
    return;
}
if(editIndex >= 0){

    vendors[editIndex] = {
        id: vendors[editIndex].id,
        name: company,
        category: category,
        location: city,
          contact: contact,
        phone: phone,

email: email,

website: website,
        approval: status,
        
  
            documents: vendors[editIndex].documents || {
        companyProfile: "",
        isoCertificate: "",
        companyRegistration: ""
    },
        lastUpdate: new Date().toLocaleDateString("ko-KR")
    };

    editIndex = -1;

}else{

vendors.push({
    id: "V" + String(vendors.length + 1).padStart(3, "0"),
    name: company,
    category: category,
    location: city,
    contact: contact,
phone: phone,

email: email,

website: website,

    approval: status,
    
  

   documents:{
    companyProfile: "",
    isoCertificate: "",
    companyRegistration: "",
    uploadDate: {
        companyProfile: "",
        isoCertificate: "",
        companyRegistration: ""
    }
},

    lastUpdate: new Date().toLocaleDateString("ko-KR")
});

}

renderVendorTable(vendors);
updateVendorKPI();
if (typeof updateSurveyChart === "function") {
    updateSurveyChart();
}

if (typeof updateRecentCompanies === "function") {
    updateRecentCompanies();
}
// LocalStorage 저장
    console.log("Before Save", vendors);
localStorage.setItem("vendors", JSON.stringify(vendors));
alert("LocalStorage Saved!");
    document.getElementById("vendorCompany").value="";
    document.getElementById("vendorCategory").value="";
    document.getElementById("vendorCity").value="";


    modal.style.display="none";
});
// ============================================
// Delete Vendor
// ============================================

function deleteVendor(index){

    const company = vendors[index].name;

if (!confirm(`Delete "${company}" ?`)) {
    return;
}

vendors.splice(selectedVendorIndex, 1);

selectedVendorIndex = null;

renderVendorTable(vendors);

localStorage.setItem("vendors", JSON.stringify(vendors));
updateDashboard();
alert("Vendor deleted.");

if (typeof updateVendorKPI === "function") {
    updateVendorKPI();
}

if (typeof updateSurveyChart === "function") {
    updateSurveyChart();
}

if (typeof updateCategoryChart === "function") {
    updateCategoryChart();
}
if (typeof updateRecentCompanies === "function") {
    updateRecentCompanies();
}
}
function editVendor(index){

    const v = vendors[index];

    document.getElementById("vendorCompany").value = v.name;
    document.getElementById("vendorCategory").value = v.category;
    document.getElementById("vendorCity").value = v.location;
    document.getElementById("vendorContact").value = v.contact || "";
document.getElementById("vendorPhone").value = v.phone || "";

document.getElementById("vendorEmail").value = v.email || "";

document.getElementById("vendorWebsite").value = v.website || "";
    document.getElementById("vendorStatus").value = v.approval;
editIndex = index;
    modal.style.display = "flex";
}
// ============================================
// Category / Status Filter
// ============================================

function applyFilters() {

const keyword = (document.getElementById("vendorSearch")?.value || "")
    .trim()
    .toLowerCase();

    const category = document.getElementById("filterCategory")?.value || "";
    const status = document.getElementById("filterStatus")?.value || "";

    const filtered = vendors.filter(v => {

        const matchKeyword =
            keyword === "" ||
            (v.name || "").toLowerCase().includes(keyword) ||
            (v.category || "").toLowerCase().includes(keyword) ||
            (v.location || "").toLowerCase().includes(keyword) ||
            (v.approval || "").toLowerCase().includes(keyword) ||
            (v.contact || "").toLowerCase().includes(keyword);

        const matchCategory =
            category === "" || v.category === category;

        const matchStatus =
            status === "" || v.approval === status;

        return matchKeyword && matchCategory && matchStatus;

    });

    renderVendorTable(filtered);

}
const vendorSearch = document.getElementById("vendorSearch");

if (vendorSearch) {
    vendorSearch.addEventListener("input", applyFilters);
}
const categoryFilter = document.getElementById("filterCategory");
const statusFilter = document.getElementById("filterStatus");

if (categoryFilter) {
    categoryFilter.addEventListener("change", applyFilters);
}

if (statusFilter) {
    statusFilter.addEventListener("change", applyFilters);
}


function showVendorDetail(index) {

    selectedVendorIndex = index;

    const v = vendors[index];

    if (!v) return;
document.getElementById("detailVendorId").value = v.id || "";
    document.getElementById("detailCompany").value = v.name || "";
    document.getElementById("detailCategory").value = v.category || "";
    document.getElementById("detailCity").value = v.location || "";
    document.getElementById("detailContact").value = v.contact || "";
    document.getElementById("detailStatus").value = v.approval || "";
    document.getElementById("detailWebsite").value = v.website || "";
document.getElementById("detailEmail").value = v.email || "";
document.getElementById("detailPhone").value = v.phone || "";
document.getElementById("detailRemarks").value = v.remarks || "";

const statusDiv = document.getElementById("documentStatus");

    if (statusDiv) {

        const docs = v.documents || {};
        const uploadedCount =
    (docs.companyProfile ? 1 : 0) +
    (docs.isoCertificate ? 1 : 0) +
    (docs.companyRegistration ? 1 : 0);
        statusDiv.innerHTML = `
<h4>📂 Documents (${uploadedCount}/3)</h4>

    <table style="width:100%; border-collapse:collapse;">

        <tr>
            <td>📄 Company Profile</td>
            <td>${docs.companyProfile ? "✅ " + docs.companyProfile : "❌ Not Uploaded"}</td>
            <td>
                <button onclick="viewDocument('companyProfile')">
                    View
                </button>
            </td>
        </tr>

        <tr>
            <td>📑 ISO Certificate</td>
            <td>${docs.isoCertificate ? "✅ " + docs.isoCertificate : "❌ Not Uploaded"}</td>
            <td>
                <button onclick="viewDocument('isoCertificate')">
                    View
                </button>
            </td>
        </tr>

        <tr>
            <td>📜 Company Registration</td>
            <td>${docs.companyRegistration ? "✅ " + docs.companyRegistration : "❌ Not Uploaded"}</td>
            <td>
                <button onclick="viewDocument('companyRegistration')">
                    View
                </button>
            </td>
        </tr>

    </table>
`;
    }
}
const historyDiv = document.getElementById("documentHistory");

if (historyDiv) {

    const history = v.documentHistory || [];

    if (history.length === 0) {

        historyDiv.innerHTML = `
            <h4>Document History</h4>
            <p>No history.</p>
        `;

    } else {

        historyDiv.innerHTML = `
            <h4>Document History</h4>

            <table class="history-table">

                <tr>
                    <th>Date</th>
                    <th>Company Profile</th>
                    <th>ISO</th>
                    <th>Registration</th>
                </tr>

                ${history.map(h=>`
                <tr>
                    <td>${h.date}</td>
                    <td>${h.companyProfile||"-"}</td>
                    <td>${h.isoCertificate||"-"}</td>
                    <td>${h.companyRegistration||"-"}</td>
                </tr>
                `).join("")}

            </table>
        `;
    }

}
document.getElementById("saveVendorBtn").addEventListener("click", saveVendorDetail);
function saveVendorDetail() {

    if (selectedVendorIndex === null) {
        alert("먼저 Vendor를 선택하세요.");
        return;
    }

    vendors[selectedVendorIndex].name =
        document.getElementById("detailCompany").value;

    vendors[selectedVendorIndex].category =
        document.getElementById("detailCategory").value;

    vendors[selectedVendorIndex].location =
        document.getElementById("detailCity").value;
vendors[selectedVendorIndex].contact =
    document.getElementById("detailContact").value;
    vendors[selectedVendorIndex].approval =
        document.getElementById("detailStatus").value;
    vendors[selectedVendorIndex].phone =
    document.getElementById("detailPhone").value;

vendors[selectedVendorIndex].email =
    document.getElementById("detailEmail").value;

vendors[selectedVendorIndex].website =
    document.getElementById("detailWebsite").value;

vendors[selectedVendorIndex].remarks =
    document.getElementById("detailRemarks").value;
vendors[selectedVendorIndex].lastUpdate =
    new Date().toISOString().split("T")[0];
    // LocalStorage 저장
localStorage.setItem("vendors", JSON.stringify(vendors));

// Dashboard 갱신
updateDashboard();

// KPI 갱신
if (typeof updateVendorKPI === "function") {
    updateVendorKPI();
}

// Chart 갱신
if (typeof updateSurveyChart === "function") {
    updateSurveyChart();
}

if (typeof updateCategoryChart === "function") {
    updateCategoryChart();
}
if (typeof updateRecentCompanies === "function") {
    updateRecentCompanies();
}
    // 최근 수정순 정렬
vendors.sort((a, b) => {
    return new Date(b.lastUpdate) - new Date(a.lastUpdate);
});
    // 테이블 다시 그리기
    renderVendorTable(vendors);
// Detail 화면 갱신
showVendorDetail(selectedVendorIndex);
    alert("Vendor 정보가 저장되었습니다.");
}
const saveDocBtn = document.getElementById("saveDocumentBtn");

if (saveDocBtn) {
    saveDocBtn.addEventListener("click", saveDocuments);
}
function saveDocuments() {

    if (selectedVendorIndex === null) {
        alert("먼저 Vendor를 선택하세요.");
        return;
    }

    if (!vendors[selectedVendorIndex].documents) {
        vendors[selectedVendorIndex].documents = {};
    }

    // Company Profile
    const companyProfile =
        document.getElementById("companyProfileFile").files[0];

    if (companyProfile) {
        vendors[selectedVendorIndex].documents.companyProfile =
            companyProfile.name;
        vendors[selectedVendorIndex].documents.companyProfileURL =
    URL.createObjectURL(companyProfile);

        document.getElementById("companyProfileName").textContent =
            companyProfile.name;
    }
    // ISO Certificate
const isoCertificate =
    document.getElementById("isoCertificateFile").files[0];

if (isoCertificate) {
    vendors[selectedVendorIndex].documents.isoCertificate =
        isoCertificate.name;
vendors[selectedVendorIndex].documents.isoCertificateURL =
    URL.createObjectURL(isoCertificate);
    document.getElementById("isoCertificateName").textContent =
        isoCertificate.name;
}

// Company Registration
const companyRegistration =
    document.getElementById("companyRegistrationFile").files[0];

if (companyRegistration) {
    vendors[selectedVendorIndex].documents.companyRegistration =
        companyRegistration.name;
vendors[selectedVendorIndex].documents.companyRegistrationURL =
    URL.createObjectURL(companyRegistration);
    document.getElementById("companyRegistrationName").textContent =
        companyRegistration.name;
}
vendors[selectedVendorIndex].lastUpdate =
    new Date().toISOString().split("T")[0];
    // LocalStorage 저장
    localStorage.setItem("vendors", JSON.stringify(vendors));
renderVendorTable(vendors);

if (typeof updateRecentCompanies === "function") {
    updateRecentCompanies();
    alert("Document Saved");
}
}
// ============================================
// Export Vendor List (CSV)
// ============================================

const exportBtn = document.getElementById("exportExcelBtn");

if (exportBtn) {
    exportBtn.addEventListener("click", exportVendorCSV);
}

function exportVendorCSV() {

    const headers = [
        "Company",
        "Category",
        "City",
        "Contact",
        "Phone",
        "Email",
        "Website",
        "Status",
        "Last Update"
    ];

    const rows = vendors.map(v => [
        v.name || "",
        v.category || "",
        v.location || "",
        v.contact || "",
        v.phone || "",
        v.email || "",
        v.website || "",
        v.approval || "",
        v.lastUpdate || ""
    ]);

    const csv = [
        headers.join(","),
        ...rows.map(row => row.map(value => `"${value}"`).join(","))
    ].join("\n");

    const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;"
    });

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = "Vendor_List.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

}
// ============================================
// Import Vendor List (CSV)
// ============================================

const importFile = document.getElementById("importVendorFile");

if (importFile) {
    importFile.addEventListener("change", importVendorCSV);
}

function importVendorCSV(event) {

    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {

        const text = e.target.result;

        const lines = text.split(/\r?\n/);

        if (lines.length <= 1) return;

        for (let i = 1; i < lines.length; i++) {

            if (!lines[i].trim()) continue;

            const cols = lines[i]
                .split(",")
                .map(v => v.replace(/"/g, "").trim());

            vendors.push({

                id: "V" + Date.now() + i,

                name: cols[0] || "",

                category: cols[1] || "",

                location: cols[2] || "",

                contact: cols[3] || "",

                phone: cols[4] || "",

                email: cols[5] || "",

                website: cols[6] || "",

                approval: cols[7] || "Pending",

                lastUpdate: cols[8] || new Date().toISOString().split("T")[0]

            });

        }

        localStorage.setItem("vendors", JSON.stringify(vendors));

        renderVendorTable(vendors);
        updateDashboard();
        updateVendorKPI();

        if (typeof updateSurveyChart === "function")
            updateSurveyChart();

        if (typeof updateCategoryChart === "function")
            updateCategoryChart();

        alert("Vendor List Imported Successfully.");

    };

    reader.readAsText(file);

}
const importBtn = document.getElementById("importExcelBtn");

if (importBtn && importVendorFile) {
    importBtn.addEventListener("click", () => {
        importVendorFile.click();
    });
}

function viewDocument(type){

    if(selectedVendorIndex === null){
        alert("먼저 Vendor를 선택하세요.");
        return;
    }

    const docs = vendors[selectedVendorIndex].documents || {};

    const fileName = docs[type];

    if(!fileName){
        alert("No uploaded file.");
        return;
    }

    const url = docs[type + "URL"];

if (url) {
    window.open(url, "_blank");
} else {
    alert("File not found.");
}
    }
function updateDashboard() {

    const total = vendors.length;

    const approved = vendors.filter(v => v.approval === "Approved").length;

    const pending = vendors.filter(v => v.approval === "Pending").length;

    const reviewed = vendors.filter(v =>
        v.approval === "Approved" ||
        v.approval === "Rejected"
    ).length;

    document.getElementById("totalVendor").textContent = total;
    document.getElementById("reviewVendor").textContent = reviewed;
    document.getElementById("pendingVendor").textContent = pending;
    document.getElementById("approvedVendor").textContent = approved;

}
document.getElementById("companyProfileFile").addEventListener("change", function () {

    if (selectedVendorIndex === null) {
        alert("먼저 Vendor를 선택하세요.");
        this.value = "";
        return;
    }

    const file = this.files[0];
    if (!file) return;

    if (!vendors[selectedVendorIndex].documents) {
        vendors[selectedVendorIndex].documents = {};
    }

    vendors[selectedVendorIndex].documents.companyProfile = file.name;

    localStorage.setItem("vendors", JSON.stringify(vendors));

    showVendorDetail(selectedVendorIndex);

    this.value = "";
});

const viewCompanyProfileBtn = document.getElementById("viewCompanyProfileBtn");

if (viewCompanyProfileBtn) {

    viewCompanyProfileBtn.addEventListener("click", function () {

        viewDocument("companyProfile");

    });

}
const viewIsoBtn = document.getElementById("viewIsoBtn");

if (viewIsoBtn) {

    viewIsoBtn.addEventListener("click", function () {

        viewDocument("isoCertificate");

    });

}

const viewRegistrationBtn = document.getElementById("viewRegistrationBtn");

if (viewRegistrationBtn) {

    viewRegistrationBtn.addEventListener("click", function () {

        viewDocument("companyRegistration");

    });

}
const copyVendorIdBtn = document.getElementById("copyVendorIdBtn");

if (copyVendorIdBtn) {

    copyVendorIdBtn.addEventListener("click", async () => {

        const vendorId =
            document.getElementById("detailVendorId").value;

        if (!vendorId) {
            alert("No Vendor ID.");
            return;
        }

        try {
            await navigator.clipboard.writeText(vendorId);
            alert("Vendor ID copied.");
        } catch (err) {
            alert("Copy failed.");
        }

    });

}

