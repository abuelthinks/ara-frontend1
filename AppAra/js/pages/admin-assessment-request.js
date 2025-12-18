// File: admin-assessment-request.js

const API_BASE = "http://127.0.0.1:8000/api"; // adjust if needed

const tbody = document.getElementById("requests-tbody");
const emptyState = document.getElementById("empty-state");
const statusFilter = document.getElementById("filter-status");

// Detail panel elements
const detailPanel = document.getElementById("detail-panel");
const detailCloseBtn = document.getElementById("detail-close");
const detailChild = document.getElementById("detail-child");
const detailParent = document.getElementById("detail-parent");
const detailGrade = document.getElementById("detail-grade");
const detailSpecialist = document.getElementById("detail-specialist");
const detailDate = document.getElementById("detail-date");
const detailTime = document.getElementById("detail-time");
const detailNotes = document.getElementById("detail-notes");
const btnApprove = document.getElementById("btn-approve");
const btnReject = document.getElementById("btn-reject");

let currentRequests = [];
let selectedRequest = null;

// ---- Helpers ----

function buildStatusChip(status) {
  const span = document.createElement("span");
  span.classList.add("chip-status");
  const upper = (status || "").toUpperCase();

  if (upper === "APPROVED") {
    span.classList.add("chip-approved");
    span.textContent = "Approved";
  } else if (upper === "REJECTED") {
    span.classList.add("chip-rejected");
    span.textContent = "Rejected";
  } else {
    span.classList.add("chip-pending");
    span.textContent = "Pending";
  }

  return span;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(timeStr) {
  if (!timeStr) return "—";
  // If backend sends "HH:MM:SS" or "HH:MM"
  return timeStr.slice(0, 5);
}

function clearTable() {
  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }
}

// ---- Rendering ----

function renderRequests(requests) {
  clearTable();

  if (!requests.length) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  requests.forEach((req) => {
    const tr = document.createElement("tr");

    const childName = req.child_name || "—";
    const parentName = req.parent_name || "—";
    const specialistName = req.specialist_name || "—";

    const tdChild = document.createElement("td");
    tdChild.textContent = childName;

    const tdParent = document.createElement("td");
    tdParent.textContent = parentName;

    const tdSpecialist = document.createElement("td");
    tdSpecialist.textContent = specialistName;

    const tdDate = document.createElement("td");
    tdDate.textContent = formatDate(req.preferred_date);

    const tdStatus = document.createElement("td");
    tdStatus.appendChild(buildStatusChip(req.status));

    const tdActions = document.createElement("td");
    const viewBtn = document.createElement("button");
    viewBtn.textContent = "View";
    viewBtn.className = "btn-ghost";
    viewBtn.addEventListener("click", () => openDetail(req));
    tdActions.appendChild(viewBtn);

    tr.appendChild(tdChild);
    tr.appendChild(tdParent);
    tr.appendChild(tdSpecialist);
    tr.appendChild(tdDate);
    tr.appendChild(tdStatus);
    tr.appendChild(tdActions);

    tbody.appendChild(tr);
  });
}

// ---- Detail panel ----

function openDetail(req) {
  selectedRequest = req;

  detailChild.textContent = req.child_name || "—";
  detailParent.textContent = req.parent_name || "—";
  detailGrade.textContent = req.grade || "—";
  detailSpecialist.textContent = req.specialist_name || "—";
  detailDate.textContent = formatDate(req.preferred_date);
  detailTime.textContent = formatTime(req.preferred_time);
  detailNotes.textContent = req.parent_notes || "—";

  detailPanel.hidden = false;

  // Enable / disable buttons based on status
  const statusUpper = (req.status || "").toUpperCase();
  const isPending = statusUpper === "PENDING";
  btnApprove.disabled = !isPending;
  btnReject.disabled = !isPending;
}

function closeDetail() {
  selectedRequest = null;
  detailPanel.hidden = true;
}

// ---- API calls ----

async function fetchRequests() {
  const status = statusFilter.value;
  let url = `${API_BASE}/assessment-requests/`;

  const params = new URLSearchParams();
  if (status !== "ALL") {
    params.append("status", status);
  }
  const qs = params.toString();
  if (qs) {
    url += `?${qs}`;
  }

  try {
    const res = await fetch(url, {
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error("Failed to load requests");
    }
    const data = await res.json();
    // Adjust if your backend returns {results: []}
    const list = Array.isArray(data) ? data : data.results || [];
    currentRequests = list;
    renderRequests(list);
  } catch (err) {
    console.error(err);
    clearTable();
    emptyState.hidden = false;
    emptyState.textContent = "Error loading assessment requests.";
  }
}

async function postAction(action) {
  if (!selectedRequest) return;

  // Adjust endpoint name to match your DRF @action
  const url = `${API_BASE}/assessment-requests/${selectedRequest.id}/${action}/`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({}), // add reason here if needed
    });

    if (!res.ok) {
      throw new Error(`Failed to ${action} request`);
    }

    // Optionally read updated object
    const updated = await res.json();

    // Update in local list
    currentRequests = currentRequests.map((r) =>
      r.id === updated.id ? updated : r
    );

    renderRequests(currentRequests);
    openDetail(updated); // keep panel open, but updated
  } catch (err) {
    console.error(err);
    alert(`Could not ${action} this request. Please try again.`);
  }
}

// ---- Event wiring ----

statusFilter.addEventListener("change", () => {
  fetchRequests();
});

detailCloseBtn.addEventListener("click", closeDetail);

btnApprove.addEventListener("click", () => {
  postAction("approve");
});

btnReject.addEventListener("click", () => {
  // If you plan to send a reason, prompt here
  // const reason = prompt("Optional: reason for rejection?");
  postAction("reject");
});

// ---- Init ----

document.addEventListener("DOMContentLoaded", () => {
  fetchRequests();
});
