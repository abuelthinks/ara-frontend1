// /AppAra/js/pages/parent-assessment.js
(function () {
  const parentNameEl = document.getElementById("parentName");
  const logoutBtn = document.getElementById("logoutBtn");

  const childNameChip = document.getElementById("childNameChip");
  const gradeChip = document.getElementById("gradeChip");

  const summaryNameEl = document.getElementById("summaryName");
  const summaryAgeEl = document.getElementById("summaryAge");
  const summaryGradeEl = document.getElementById("summaryGrade");
  const summarySchoolEl = document.getElementById("summarySchool");

  const formEl = document.getElementById("parentAssessmentForm");
  const specialistListEl = document.getElementById("specialistList");

  let selectedSpecialistId = null;

  function setParentName() {
    if (window.Auth && typeof Auth.getCurrentUser === "function") {
      const user = Auth.getCurrentUser();
      if (user && (user.first_name || user.last_name)) {
        parentNameEl.textContent = `Welcome, ${user.first_name || ""} ${
          user.last_name || ""
        }`.trim();
      }
    }
  }

  function formatAgeFromDob(dobStr) {
    if (!dobStr) return "—";
    const dob = new Date(dobStr);
    if (Number.isNaN(dob.getTime())) return "—";
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return `${age} years`;
  }

  function showToast(message) {
    alert(message);
  }

  function getChildIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("childId");
  }

  // --------- Load child summary ---------
  async function loadChild() {
    const childId = getChildIdFromUrl();
    if (!childId || childId === "undefined") {
      console.warn("[ParentAssessment] Missing or invalid childId in URL");
      return;
    }

    try {
      const child = await API.get(`/children/${childId}/`);

      const fullName = `${child.first_name} ${child.last_name}`.trim();
      childNameChip.textContent = `Child: ${fullName || "—"}`;
      gradeChip.textContent = `Grade: ${child.grade_level || "—"}`;

      summaryNameEl.textContent = fullName || "—";
      summaryAgeEl.textContent = formatAgeFromDob(child.date_of_birth);
      summaryGradeEl.textContent = child.grade_level || "—";
      summarySchoolEl.textContent = "—"; // no school field yet
    } catch (err) {
      console.error(err);
      showToast("Unable to load child details. Please try again.");
    }
  }

  // --------- Specialists: fetch & render cards ---------
function buildSpecialistCard(specialist) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "specialist-card";
  card.dataset.id = specialist.user_id;

  const initials =
    (specialist.full_name || "?")
      .split(" ")
      .filter(Boolean)
      .map((p) => p[0].toUpperCase())
      .join("")
      .slice(0, 2) || "?";

  card.innerHTML = `
    <div class="specialist-card__avatar">${initials}</div>
    <div class="specialist-card__content">
      <div class="specialist-card__header">
        <span class="specialist-card__name">${specialist.full_name}</span>
        ${
          specialist.years_experience
            ? `<span class="specialist-card__meta">${specialist.years_experience}+ yrs experience</span>`
            : ""
        }
      </div>
      ${
        specialist.display_title || specialist.specialization
          ? `<div class="specialist-card__title">
               ${specialist.display_title || specialist.specialization}
             </div>`
          : ""
      }
      ${
        Array.isArray(specialist.focus_areas) &&
        specialist.focus_areas.length > 0
          ? `<div class="specialist-card__chips">
               ${specialist.focus_areas
                 .slice(0, 3)
                 .map(
                   (tag) => `<span class="specialist-chip">${tag}</span>`
                 )
                 .join("")}
             </div>`
          : ""
      }
      <div class="specialist-card__status-row">
        <span class="specialist-card__status ${
          specialist.accepts_new_assessments === false
            ? "specialist-card__status--full"
            : "specialist-card__status--open"
        }">
          ${
            specialist.accepts_new_assessments === false
              ? "Not accepting new assessments"
              : "Accepting new assessments"
          }
        </span>
      </div>
    </div>
  `;

  card.addEventListener("click", () => {
    selectedSpecialistId = specialist.user_id;
    document
      .querySelectorAll(".specialist-card--selected")
      .forEach((el) => el.classList.remove("specialist-card--selected"));
    card.classList.add("specialist-card--selected");
  });

  return card;
}


async function loadSpecialists() {
  if (!specialistListEl) return;

  specialistListEl.innerHTML =
    `<p class="ara-helper-text">Loading specialists...</p>`;

  try {
    const resp = await API.get("/specialists/");
    console.log("[ParentAssessment] raw specialists response:", resp);

    // Handle paginated vs plain array
    const specialists = Array.isArray(resp) ? resp : resp.results || [];

    if (!Array.isArray(specialists) || specialists.length === 0) {
      specialistListEl.innerHTML =
        `<p class="ara-helper-text">No specialists are currently available for booking. Please contact the center.</p>`;
      return;
    }

    specialistListEl.innerHTML = "";
    specialists.forEach((spec) =>
      specialistListEl.appendChild(buildSpecialistCard(spec))
    );
  } catch (err) {
    console.error(err);
    specialistListEl.innerHTML =
      `<p class="ara-helper-text ara-helper-text--error">Could not load specialists. Please refresh the page or try again later.</p>`;
  }
}

  // --------- Submit handler ---------
  async function handleSubmit(event) {
    event.preventDefault();

    const childId = getChildIdFromUrl();
    if (!childId) {
      showToast("Missing child information. Please go back to the dashboard.");
      return;
    }
    if (!selectedSpecialistId) {
      showToast("Please choose a specialist before submitting.");
      return;
    }

    const formData = new FormData(formEl);

    const payload = {
      child: childId,
      specialist: selectedSpecialistId,
      preferred_date: formData.get("preferred_date") || null,
      preferred_time: formData.get("preferred_time") || null,
    };

    try {
      await API.post("/parent-assessment-requests/", payload);
      showToast("Assessment request submitted successfully.");
      window.location.href = "/AppAra/html/parent/parent-submitted.html";
    } catch (err) {
      console.error(err);
      showToast(
        "Something went wrong while submitting the assessment request. Please try again."
      );
    }
  }

  // --------- Init ---------
  document.addEventListener("DOMContentLoaded", () => {
    if (window.Auth && typeof Auth.requireRole === "function") {
      Auth.requireRole("PARENT");
    }

    setParentName();
    loadChild();
    loadSpecialists();

    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (window.Auth) {
        Auth.logout();
      }
    });

    formEl.addEventListener("submit", handleSubmit);
  });
})();
