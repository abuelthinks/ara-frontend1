/**
 * Parent Dashboard - Refactored
 * Child card states: Intake needed → For assessment → Assessment scheduled → Assessed → Enrolled
 */

let currentUser = null;
let children = [];

// --- Auth Check ---
window.onload = async function() {
    if (window.Auth && typeof Auth.requireRole === 'function') {
        const ok = Auth.requireRole('PARENT');
        if (!ok) return;
    }

    currentUser = Auth.getCurrentUser();
    if (currentUser) {
        document.getElementById('parentEmail').textContent = currentUser.email;
        document.getElementById('parentName').textContent = currentUser.first_name || 'Parent';
    }

    setupLogout();
    await loadChildren();
};

// --- Load Children ---
async function loadChildren() {
    try {
        const response = await API.get('/children/');
        children = Array.isArray(response) ? response : response.results || [];

        const grid = document.getElementById('childrenGrid');
        grid.innerHTML = '';

        if (children.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><i class="fas fa-child"></i></div>
                    <h3 class="empty-title">No children registered yet</h3>
                    <p class="empty-message">Register your child to get started with assessments</p>
                    <button class="empty-action" onclick="goToIntake()">
                        <i class="fas fa-plus"></i> Register Child
                    </button>
                </div>
            `;
        } else {
            children.forEach(child => {
                const card = createChildCard(child);
                grid.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error loading children:', error);
        document.getElementById('childrenGrid').innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-exclamation-circle"></i></div>
                <h3 class="empty-title">Error loading children</h3>
                <p class="empty-message">Please refresh the page or contact support</p>
            </div>
        `;
    }
}

// --- Determine Child Status ---
function getChildStatus(child) {
    // Check if intake completed
    const intakeCompleted = child.intake_status === 'completed';
    
    // If no intake, show "Intake needed"
    if (!intakeCompleted) {
        return {
            displayStatus: 'Intake needed',
            badgeClass: 'badge-intake-needed',
            icon: 'fa-file-alt',
            statusLine: 'Next step: Fill up intake form'
        };
    }

    // After intake, check assessment status
    const assessmentStatus = child.assessment_status || 'none';
    
    if (assessmentStatus === 'none' || assessmentStatus === 'for_assessment') {
        return {
            displayStatus: 'For assessment',
            badgeClass: 'badge-for-assessment',
            icon: 'fa-calendar',
            statusLine: 'Next step: Book an assessment for your child'
        };
    }

    if (assessmentStatus === 'scheduled') {
        const scheduledDate = child.assessment_scheduled_date 
            ? new Date(child.assessment_scheduled_date).toLocaleDateString() 
            : 'TBD';
        return {
            displayStatus: `Assessment scheduled – ${scheduledDate}`,
            badgeClass: 'badge-assessment-scheduled',
            icon: 'fa-calendar-check',
            statusLine: 'Assessment booked. Awaiting session.'
        };
    }

    if (assessmentStatus === 'completed') {
        const enrollmentStatus = child.enrollment_status || 'none';
        
        if (enrollmentStatus === 'enrolled') {
            return {
                displayStatus: 'Enrolled',
                badgeClass: 'badge-enrolled',
                icon: 'fa-check-circle',
                statusLine: 'Child is enrolled. View assessment, IEP, and progress.'
            };
        }

        return {
            displayStatus: 'Assessed',
            badgeClass: 'badge-assessed',
            icon: 'fa-check-circle',
            statusLine: 'Assessment completed. Ready to enroll.'
        };
    }

    return {
        displayStatus: 'Unknown',
        badgeClass: 'badge-for-assessment',
        icon: 'fa-question-circle',
        statusLine: 'Status unknown'
    };
}

// --- Create Child Card ---
function createChildCard(child) {
    const card = document.createElement('div');
    card.className = 'child-card';

    // Calculate age
    const dob = new Date(child.date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }

    // Get status
    const status = getChildStatus(child);

    // Build action buttons based on status
    let actionsHTML = '';

    // Intake needed → Show "Fill intake" button
    if (child.intake_status !== 'completed') {
        actionsHTML = `
            <button class="action-btn action-btn-primary" onclick="goToIntake('${child.id}')">
                <i class="fas fa-file-alt"></i> Start here: Fill intake
            </button>
            <button class="action-btn action-btn-secondary" onclick="editChildInfo('${child.id}')">
                <i class="fas fa-edit"></i> Edit
            </button>
        `;
    }
    // For assessment (intake completed) → Show "Book assessment" button
    else if (!child.assessment_status || child.assessment_status === 'for_assessment') {
        actionsHTML = `
            <button class="action-btn action-btn-primary" onclick="goToAssessmentBooking('${child.id}')">
                <i class="fas fa-calendar-plus"></i> Book assessment
            </button>
            <button class="action-btn action-btn-secondary" onclick="editChildInfo('${child.id}')">
                <i class="fas fa-edit"></i> Edit
            </button>
        `;
    }
    // Assessment scheduled → Show "View assessment details" button
    else if (child.assessment_status === 'scheduled') {
        actionsHTML = `
            <button class="action-btn action-btn-primary" onclick="goToAssessmentDetails('${child.id}')">
                <i class="fas fa-calendar-check"></i> View assessment details
            </button>
            <button class="action-btn action-btn-secondary" onclick="editChildInfo('${child.id}')">
                <i class="fas fa-edit"></i> Edit
            </button>
        `;
    }
    // Assessed (not enrolled) → Show "View assessment" and "Enroll" buttons
    else if (child.assessment_status === 'completed' && child.enrollment_status !== 'enrolled') {
        actionsHTML = `
            <button class="action-btn action-btn-primary" onclick="goToAssessmentReport('${child.id}')">
                <i class="fas fa-eye"></i> View assessment
            </button>
            <button class="action-btn action-btn-secondary" onclick="goToEnroll('${child.id}')">
                <i class="fas fa-user-plus"></i> Enroll
            </button>
        `;
    }
    // Enrolled → Show "View assessment", "View IEP", "View progress" buttons
    else if (child.enrollment_status === 'enrolled') {
        actionsHTML = `
            <button class="action-btn action-btn-primary" onclick="goToAssessmentReport('${child.id}')">
                <i class="fas fa-eye"></i> View assessment
            </button>
            <button class="action-btn action-btn-secondary" onclick="goToIep('${child.id}')">
                <i class="fas fa-file-alt"></i> View IEP
            </button>
            <button class="action-btn action-btn-secondary" onclick="goToProgress('${child.id}')">
                <i class="fas fa-chart-line"></i> View progress
            </button>
        `;
    }

    card.innerHTML = `
        <div class="child-header">
            <div style="display: flex; align-items: flex-start; gap: 12px; flex: 1;">
                <div class="child-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="child-meta">
                    <h3 class="child-name">${child.first_name} ${child.last_name}</h3>
                    <p class="child-age">${age} years old • Grade: ${child.grade_level || 'N/A'}</p>
                </div>
            </div>
            <span class="child-badge ${status.badgeClass}">
                <i class="fas ${status.icon}"></i> ${status.displayStatus}
            </span>
        </div>

        <p class="status-line">
            <i class="fas fa-info-circle"></i> ${status.statusLine}
        </p>

        <div class="card-actions">
            ${actionsHTML}
        </div>
    `;

    return card;
}

// --- Navigation Helpers ---
function goToIntake(childId = null) {
    const base = window.BASE_URL || '/AppAra';
    if (childId) {
        window.location.href = `${base}/html/parent/parent-input.html?childId=${childId}`;
    } else {
        window.location.href = `${base}/html/parent/parent-input.html`;
    }
}

function goToAssessmentBooking(childId) {
    const base = window.BASE_URL || '/AppAra';
    window.location.href = `${base}/html/parent/parent-assessment.html?childId=${childId}#book`;
}

function goToAssessmentDetails(childId) {
    const base = window.BASE_URL || '/AppAra';
    window.location.href = `${base}/html/parent/parent-assessment.html?childId=${childId}#my-assessments`;
}

function goToAssessmentReport(childId) {
    const base = window.BASE_URL || '/AppAra';
    window.location.href = `${base}/html/parent/parent-assessment.html?childId=${childId}&view=report`;
}

function goToEnroll(childId) {
    const base = window.BASE_URL || '/AppAra';
    window.location.href = `${base}/html/parent/parent-enroll.html?childId=${childId}`;
}

function goToIep(childId) {
    const base = window.BASE_URL || '/AppAra';
    window.location.href = `${base}/html/parent/parent-progress.html?childId=${childId}#iep`;
}

function goToProgress(childId) {
    const base = window.BASE_URL || '/AppAra';
    window.location.href = `${base}/html/parent/parent-progress.html?childId=${childId}#weekly`;
}

function editChildInfo(childId) {
    // Redirect to parent-input with edit=true to pre-fill saved data
    const base = window.BASE_URL || '/AppAra';
    window.location.href = `${base}/html/parent/parent-input.html?childId=${childId}&edit=true`;
}

// --- Logout ---
function setupLogout() {
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (window.Auth && typeof Auth.logout === 'function') {
                Auth.logout();
            }
        });
    }
}
