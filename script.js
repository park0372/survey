/* =========================================================
   IVIP DASHBOARD SCRIPT — DESIGN/CHART LAYER
   Vendor CRUD is handled by vendor-manager.js
========================================================= */

const news = [
  "NCEC continues contractor qualification program",
  "Baghdad housing project preparation resumed",
  "Steel price remains stable",
  "New infrastructure package announced",
  "Electricity sector investment discussion"
];

function renderNews(){
  const newsList = document.getElementById("newsList");
  if(!newsList) return;
  newsList.innerHTML = "";
  news.forEach(title=>{
    const li = document.createElement("li");
    li.textContent = title;
    newsList.appendChild(li);
  });
}

function updateRecentCompanies(){
  if(typeof vendors === "undefined") return;
  const box = document.getElementById("recentCompanies");
  if(!box) return;

  box.innerHTML = "";
  vendors.slice().reverse().slice(0,5).forEach(v=>{
    const card = document.createElement("div");
    card.className = "recent-card";
    card.innerHTML = `
      <h4>${v.name || ""}</h4>
      <p>${v.category || ""}</p>
      <span>${v.location || v.city || ""}</span>
    `;
    box.appendChild(card);
  });
}

let surveyChart = null;

function updateSurveySummary(approved, pending, total){
  const percent = total ? Math.round((approved / total) * 100) : 0;

  const percentEl = document.getElementById("surveyApprovalPercent");
  const approvedEl = document.getElementById("surveyApproved");
  const pendingEl = document.getElementById("surveyPending");
  const totalEl = document.getElementById("surveyTotal");

  if(percentEl) percentEl.textContent = percent + "%";
  if(approvedEl) approvedEl.textContent = approved;
  if(pendingEl) pendingEl.textContent = pending;
  if(totalEl) totalEl.textContent = total;
}

function updateSurveyChart(){
  if(typeof vendors === "undefined") return;
  const canvas = document.getElementById("surveyChart");
  if(!canvas || typeof Chart === "undefined") return;

  const approved = vendors.filter(v => v.approval === "Approved").length;
  const pending = vendors.filter(v => v.approval !== "Approved").length;
  const total = vendors.length;

  updateSurveySummary(approved, pending, total);

  if(!surveyChart){
    surveyChart = new Chart(canvas.getContext("2d"), {
      type:"doughnut",
      data:{
        labels:["Approved","Pending"],
        datasets:[{
          data:[approved, pending],
          backgroundColor:["#38A1E8","#F59E0B"],
          borderWidth:0,
          hoverOffset:3
        }]
      },
      options:{
        responsive:true,
        maintainAspectRatio:false,
        cutout:"62%",
        radius:"72%",
        plugins:{
          legend:{display:false},
          tooltip:{
            callbacks:{
              label:function(context){
                return " " + context.label + ": " + context.raw;
              }
            }
          }
        }
      }
    });
  }else{
    surveyChart.data.datasets[0].data = [approved, pending];
    surveyChart.update();
  }
}

function initDashboard(){
  renderNews();
  updateRecentCompanies();
  updateSurveyChart();
}

document.addEventListener("DOMContentLoaded", initDashboard);

/* Top search is optional; never throw if the header search is absent. */
const topSearch = document.getElementById("searchBox");
if(topSearch){
  topSearch.addEventListener("keyup", ()=>{
    if(typeof vendors === "undefined" || typeof renderVendorTable !== "function") return;
    const keyword = topSearch.value.toLowerCase().trim();
    const filtered = vendors.filter(v =>
      (v.name || "").toLowerCase().includes(keyword) ||
      (v.category || "").toLowerCase().includes(keyword) ||
      (v.location || v.city || "").toLowerCase().includes(keyword) ||
      (v.approval || "").toLowerCase().includes(keyword)
    );
    renderVendorTable(filtered);
  });
}

console.log("IVIP Dashboard Script Loaded");
