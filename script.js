const companies = [
{
    company:"Al Rashid Construction",
    category:"Civil",
    city:"Baghdad",
    score:92,
    status:"Approved"
},
{
    company:"Baghdad Electric",
    category:"Electrical",
    city:"Baghdad",
    score:84,
    status:"Survey"
},
{
    company:"Iraq MEP",
    category:"Mechanical",
    city:"Basra",
    score:88,
    status:"Review"
},
{
    company:"Modern Steel",
    category:"Steel",
    city:"Karbala",
    score:76,
    status:"Pending"
},
{
    company:"Al Noor Co.",
    category:"Architecture",
    city:"Erbil",
    score:95,
    status:"Approved"
}
];


/* ===========================
   Recent Companies
=========================== */

const recentBox = document.getElementById("recentCompanies");

companies.forEach(c=>{

const card=document.createElement("div");

card.className="recent-card";

card.innerHTML=`
<h4>${c.company}</h4>
<p>${c.category}</p>
<span>${c.city}</span>
`;

recentBox.appendChild(card);

});


/* ===========================
   News
=========================== */

const news=[

"NCEC continues contractor qualification program",

"Baghdad housing project preparation resumed",

"Steel price remains stable",

"New infrastructure package announced",

"Electricity sector investment discussion"

];

const newsList=document.getElementById("newsList");

news.forEach(n=>{

const li=document.createElement("li");

li.textContent=n;

newsList.appendChild(li);

});


/* ===========================
   Survey Progress Chart
=========================== */

const ctx = document
    .getElementById("surveyChart")
    .getContext("2d");

const surveyChart = new Chart(ctx,{

type: "doughnut",

    data: {
        labels: [
            "Approved",
            "Review",
            "Pending",
            "Survey"
        ],

       datasets: [{
    data: [695,132,74,344],
    borderWidth: 0,

    radius: "75%",
    cutout: "60%"
}]
},
    options:{
    responsive:true,
    maintainAspectRatio:false,

    layout:{
        padding:20
    },

    plugins:{
        legend:{
            position:"bottom"
        }
    }
    }        
});
function updateSurveyChart() {

    if (typeof vendors === "undefined") return;
    if (typeof surveyChart === "undefined") return;

    const approved = vendors.filter(v => v.approval === "Approved").length;
    const review = vendors.filter(v => v.approval === "Review").length;
    const pending = vendors.filter(v => v.approval === "Pending").length;
    const survey = vendors.filter(v => v.approval === "Survey").length;

    surveyChart.data.datasets[0].data = [
        approved,
        review,
        pending,
        survey
    ];
   surveyChart.update();

}
/* ===========================
   Recent Companies Update
=========================== */

function updateRecentCompanies() {

    if (typeof vendors === "undefined") return;

    const recentBox = document.getElementById("recentCompanies");

    if (!recentBox) return;

    recentBox.innerHTML = "";

    vendors
        .slice()
        .reverse()
        .slice(0, 6)
        .forEach(v => {

            const card = document.createElement("div");

            card.className = "recent-card";

            card.innerHTML = `
                <h4>${v.name}</h4>
                <p>${v.category}</p>
                <span>${v.city}</span>
            `;

            recentBox.appendChild(card);

        });

}


/* ===========================
   Dashboard Search
=========================== */

const topSearch = document.getElementById("searchBox");

topSearch.addEventListener("keyup", () => {

    const keyword = topSearch.value.toLowerCase().trim();

    const filtered = vendors.filter(v => {

        return (
            (v.name || "").toLowerCase().includes(keyword) ||
            (v.category || "").toLowerCase().includes(keyword) ||
            (v.city || "").toLowerCase().includes(keyword) ||
            (v.status || "").toLowerCase().includes(keyword)
        );

    });

    renderVendorTable(filtered);

});

console.log("IVIP V1.1 Loaded Successfully");

/* ===========================
   Vendor Intelligence Update
=========================== */


// KPI 계산
function updateVendorKPI(){

    if(typeof vendors === "undefined") return;

    document.getElementById("totalVendor").innerText =
        vendors.length;

    document.getElementById("approvedVendor").innerText =
        vendors.filter(v=>v.approval==="Approved").length;

    document.getElementById("reviewVendor").innerText =
        vendors.filter(v=>v.approval==="Review").length;

    document.getElementById("pendingVendor").innerText =
        vendors.filter(v=>v.approval==="Pending").length;

}
updateVendorKPI();
updateSurveyChart();
updateRecentCompanies();
/* ===========================
   STEP 10-1 : Add Vendor
=========================== */

const addVendorBtn = document.getElementById("addVendorBtn");

if (addVendorBtn) {
    addVendorBtn.addEventListener("click", addVendor);
}

function addVendor() {

    const company = document.getElementById("vendorCompany").value.trim();
    const category = document.getElementById("vendorCategory").value;
    const city = document.getElementById("vendorCity").value.trim();

    if (company === "") {
        alert("Please enter Company Name.");
        return;
    }

    const vendor = {
        name: company,
        category: category,
        city: city,
        approval: "Survey"
    };

    vendors.push(vendor);

    localStorage.setItem("vendors", JSON.stringify(vendors));

    renderVendorTable(vendors);
    updateVendorKPI();
    updateSurveyChart();
    updateRecentCompanies();

    document.getElementById("vendorCompany").value = "";
    document.getElementById("vendorCategory").selectedIndex = 0;
    document.getElementById("vendorCity").value = "";

    alert("Vendor added successfully.");
}






