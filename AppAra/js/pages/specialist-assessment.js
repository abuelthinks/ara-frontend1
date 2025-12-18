/**
 * Specialist Assessment Page
 * Displays list of students for assessment, in progress, and completed
 */

// Global state for filtering
let allStudents = {
    'for-assessment': [],
    'in-progress': [],
    'completed': []
};

// Page initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('[SpecialistAssessment] Page loaded');

    // Check authentication
    if (!Auth.requireRole('SPECIALIST')) {
        return;
    }

    // Display current user
    displayUserInfo();

    // Wire up button clicks (event delegation)
    document.addEventListener('click', (event) => {
        const primaryBtn = event.target.closest('.primary-action-btn');
        if (primaryBtn) {
            const card = primaryBtn.closest('.student-card');
            const childId = card.getAttribute('data-child-id');
            const requestId = card.getAttribute('data-request-id') || null;
            const status = primaryBtn.getAttribute('data-status');

            if (status === 'for-assessment') {
                acceptRequest(requestId, childId);
            } else {
                const name = card.getAttribute('data-name') || '';
                startAssessment(childId, name);
            }
            return;
        }

        const viewBtn = event.target.closest('.view-profile-btn');
        if (viewBtn) {
            const card = viewBtn.closest('.student-card');
            const childId = card.getAttribute('data-child-id');
            viewStudentProfile(childId);
        }
    });

    // Load students
    loadAssessmentStudents();
});

/**
 * Display current user information
 */
function displayUserInfo() {
    const currentUser = Auth.getCurrentUser();
    if (currentUser) {
        document.getElementById('userName').textContent =
            currentUser.first_name || currentUser.username || 'Specialist';
    }
}

/**
 * Load all students with their assessment statuses
 */
async function loadAssessmentStudents() {
    try {
        console.log('[SpecialistAssessment] Fetching students...');

        // Fetch all children (base URL already has /api)
        const childrenResponse = await API.get('/children/');
        console.log('[SpecialistAssessment] Children response:', childrenResponse);

        const children = Array.isArray(childrenResponse)
            ? childrenResponse
            : childrenResponse.results || [];

        if (!children || children.length === 0) {
            console.warn('[SpecialistAssessment] No children found');
            displayEmptyState('for-assessment');
            displayEmptyState('in-progress');
            displayEmptyState('completed');
            updateTabCounts();
            return;
        }

        console.log(`[SpecialistAssessment] Found ${children.length} children`);

        const assessmentsByStatus = {
            'for-assessment': [],
            'in-progress': [],
            'completed': []
        };

        for (const child of children) {
            try {
                const childId = child.child_id; // backend PK

                // Assessments for this child
                const assessmentsResponse = await API.get(
                    `/children/${childId}/assessments/`
                );
                const assessments = Array.isArray(assessmentsResponse)
                    ? assessmentsResponse
                    : assessmentsResponse.results || [];

                console.log(
                    `[SpecialistAssessment] Assessments for child ${childId}:`,
                    assessments
                );

                // Default status
                let status = 'for-assessment';
                let latestAssessment = null;

                if (assessments.length > 0) {
                    latestAssessment = assessments
                        .slice()
                        .sort(
                            (a, b) =>
                                new Date(b.created_at) - new Date(a.created_at)
                        )[0];

                    if (latestAssessment.status === 'completed') {
                        status = 'completed';
                    } else if (latestAssessment.status === 'in_progress') {
                        status = 'in-progress';
                    } else {
                        status = 'for-assessment';
                    }
                }

                // Try to get latest assessment request for this child
                let requestId = null;
                let requestStatus = null;
                try {
                    const reqResponse = await API.get(
                        `/assessment-requests/?child=${childId}`
                    );
                    console.log(
                        '[SpecialistAssessment] Requests for child',
                        childId,
                        reqResponse
                    );
                    const reqs = Array.isArray(reqResponse)
                        ? reqResponse
                        : reqResponse.results || [];
                    console.log('[SpecialistAssessment] Raw requests array for child', childId, reqs);
                    if (reqs.length > 0) {
                        const latestReq = reqs
                            .slice()
                            .sort(
                                (a, b) =>
                                    new Date(b.created_at) -
                                    new Date(a.created_at)
                            )[0];
                        requestId = latestReq.request_id || latestReq.assessment_request_id || latestReq.id;
                        requestStatus = latestReq.status; // PENDING / APPROVED / REJECTED

                        console.log(
                            '[SpecialistAssessment] Using request',
                            requestId,
                            'status',
                            requestStatus,
                            'for child',
                            childId
                        );

                        if (requestStatus === 'PENDING') {
                            status = 'for-assessment';
                        }
                    }

                } catch (e) {
                    console.warn(
                        '[SpecialistAssessment] No assessment request for child',
                        childId,
                        e
                    );
                }

                // Build student object
                const name =
                    child.name ||
                    `${child.first_name || ''} ${
                        child.last_name || ''
                    }`.trim() ||
                    'Unnamed child';

                const studentData = {
                    id: childId,
                    name: name,
                    grade: child.grade_level || 'N/A',
                    dateOfBirth: child.date_of_birth
                        ? formatDate(child.date_of_birth)
                        : 'N/A',
                    rawDateOfBirth: child.date_of_birth || null,
                    medicalAlerts: child.medical_alerts || 'None',
                    intakeStatus: child.intake_status || 'Completed',
                    status: status,
                    assessmentId: latestAssessment ? latestAssessment.id : null,
                    assessmentDate: latestAssessment
                        ? formatDate(latestAssessment.created_at)
                        : null,
                    assessmentRequestId: requestId,
                    assessmentRequestStatus: requestStatus
                };

                assessmentsByStatus[status].push(studentData);
            } catch (error) {
                console.error(
                    '[SpecialistAssessment] Error fetching assessments for child:',
                    error
                );

                const childId = child.child_id;
                const name =
                    child.name ||
                    `${child.first_name || ''} ${
                        child.last_name || ''
                    }`.trim() ||
                    'Unnamed child';

                const studentData = {
                    id: childId,
                    name: name,
                    grade: child.grade_level || 'N/A',
                    dateOfBirth: child.date_of_birth
                        ? formatDate(child.date_of_birth)
                        : 'N/A',
                    rawDateOfBirth: child.date_of_birth || null,
                    medicalAlerts: child.medical_alerts || 'None',
                    intakeStatus: child.intake_status || 'Completed',
                    status: 'for-assessment',
                    assessmentId: null,
                    assessmentDate: null,
                    assessmentRequestId: null,
                    assessmentRequestStatus: null
                };
                assessmentsByStatus['for-assessment'].push(studentData);
            }
        }

        // Store for filtering
        allStudents = assessmentsByStatus;

        // Display students
        displayStudents('for-assessment', assessmentsByStatus['for-assessment']);
        displayStudents('in-progress', assessmentsByStatus['in-progress']);
        displayStudents('completed', assessmentsByStatus['completed']);

        // Update tab counts
        updateTabCounts();
    } catch (error) {
        console.error('[SpecialistAssessment] Error loading students:', error);
        showError('Failed to load students. Please try again.');
    }
}

/**
 * Update tab counts
 */
function updateTabCounts() {
    document.getElementById('forAssessmentCount').textContent =
        allStudents['for-assessment'].length;
    document.getElementById('inProgressCount').textContent =
        allStudents['in-progress'].length;
    document.getElementById('completedCount').textContent =
        allStudents['completed'].length;
}

/**
 * Display students in a tab
 */
function displayStudents(tabId, students) {
    const container = document.getElementById(tabId + 'List');

    if (!container) {
        console.error(
            '[SpecialistAssessment] Missing container for tab:',
            tabId + 'List'
        );
        return;
    }

    if (!students || students.length === 0) {
        displayEmptyState(tabId);
        return;
    }

    container.innerHTML = students.map(createStudentCard).join('');
}

/**
 * Calculate age from DOB
 */
function calculateAge(dateString) {
    if (!dateString) return 'N/A';
    const dob = new Date(dateString);
    if (isNaN(dob)) return 'N/A';

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return `${age} years`;
}

/**
 * Create a student card HTML element
 */
function createStudentCard(student) {
    const statusText =
        {
            'for-assessment': 'Pending Assessment',
            'in-progress': 'In Progress',
            completed: 'Completed'
        }[student.status] || 'Pending';

    const statusClass =
        {
            'for-assessment': 'status-pending',
            'in-progress': 'status-in-progress',
            completed: 'status-completed'
        }[student.status] || 'status-pending';

    const actionButtonText =
        {
            'for-assessment': 'Accept Request',
            'in-progress': 'Continue Assessment',
            completed: 'View Assessment'
        }[student.status] || 'Accept Request';

    const ageText = calculateAge(student.rawDateOfBirth || student.dateOfBirth);
    const intakeStatus = student.intakeStatus || 'Completed';

    return `
        <div class="student-card"
             data-name="${escapeHtml(student.name)}"
             data-grade="${escapeHtml(student.grade)}"
             data-child-id="${student.id}"
             data-request-id="${student.assessmentRequestId || ''}">
            <div class="student-header">
                <div class="student-name">${escapeHtml(student.name)}</div>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>

            <div class="student-info">
                <div class="info-item">
                    <span class="info-label">Age</span>
                    <span class="info-value">${escapeHtml(ageText)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Grade</span>
                    <span class="info-value">${escapeHtml(student.grade)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Medical Alerts</span>
                    <span class="info-value">${escapeHtml(
                        student.medicalAlerts
                    )}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Intake Status</span>
                    <span class="info-value">${escapeHtml(
                        intakeStatus
                    )}</span>
                </div>
            </div>

            <div class="student-actions">
                <button class="btn btn-primary primary-action-btn"
                        data-status="${student.status}">
                    ${actionButtonText}
                </button>
                <button class="btn btn-secondary view-profile-btn">
                    View Profile
                </button>
            </div>
        </div>
    `;
}

/**
 * Display empty state message
 */
function displayEmptyState(tabId) {
    const container = document.getElementById(tabId + 'List');
    if (!container) return;

    const emptyMessages = {
        'for-assessment': {
            icon: '📚',
            title: 'No Students Ready',
            message:
                'No students assigned for assessment at this time. Check back later or contact your administrator.'
        },
        'in-progress': {
            icon: '⏳',
            title: 'No Assessments In Progress',
            message: 'Start assessing a student to see their progress here.'
        },
        completed: {
            icon: '✅',
            title: 'No Completed Assessments',
            message: 'Completed assessments will appear here.'
        }
    };

    const msg = emptyMessages[tabId] || emptyMessages['for-assessment'];

    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">${msg.icon}</div>
            <div class="empty-state-title">${msg.title}</div>
            <div class="empty-state-message">${msg.message}</div>
        </div>
    `;
}

/**
 * Switch between tabs
 */
function switchTab(tabId) {
    console.log('[SpecialistAssessment] Switching to tab:', tabId);

    document.querySelectorAll('.tab-content').forEach((tab) => {
        tab.classList.remove('active');
    });

    document.querySelectorAll('.tab-button').forEach((btn) => {
        btn.classList.remove('active');
    });

    document.getElementById(tabId).classList.add('active');

    if (event && event.target) {
        event.target.classList.add('active');
    }

    const searchInput = document.getElementById(tabId + 'Search');
    if (searchInput) {
        searchInput.value = '';
    }
}

/**
 * Filter students by name or grade
 */
function filterStudents(tabId) {
    const searchInput = document.getElementById(tabId + 'Search');
    const searchTerm = (searchInput.value || '').toLowerCase();
    const cards = document.querySelectorAll(`#${tabId}List .student-card`);

    let visibleCount = 0;

    cards.forEach((card) => {
        const name = card.getAttribute('data-name').toLowerCase();
        const grade = card.getAttribute('data-grade').toLowerCase();

        if (name.includes(searchTerm) || grade.includes(searchTerm)) {
            card.style.display = '';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    const container = document.getElementById(tabId + 'List');
    if (visibleCount === 0 && allStudents[tabId].length > 0) {
        const emptyCard = container.querySelector('.empty-state');
        if (!emptyCard) {
            const div = document.createElement('div');
            div.className = 'empty-state';
            div.innerHTML = `
                <div class="empty-state-icon">🔍</div>
                <div class="empty-state-title">No Results Found</div>
                <div class="empty-state-message">
                    No students match your search: "${escapeHtml(searchTerm)}"
                </div>
            `;
            container.appendChild(div);
        }
    }
}

/**
 * Accept a parent's assessment request for this child
 */
async function acceptRequest(requestId, childId) {
    try {
        if (!requestId) {
            showError('No assessment request found for this child.');
            return;
        }

        console.log(
            '[SpecialistAssessment] Accepting request',
            requestId,
            'for child',
            childId
        );

        // Approve assessment request
        await API.post(`/assessment-requests/${requestId}/approve/`, {});

        showSuccess('Assessment request accepted.');

        // Move from for-assessment to in-progress
        const index = allStudents['for-assessment'].findIndex(
            (s) => String(s.id) === String(childId)
        );
        if (index !== -1) {
            const student = allStudents['for-assessment'][index];
            student.status = 'in-progress';
            student.assessmentRequestStatus = 'APPROVED';
            allStudents['for-assessment'].splice(index, 1);
            allStudents['in-progress'].push(student);
        }

        // Re-render and update counts
        displayStudents('for-assessment', allStudents['for-assessment']);
        displayStudents('in-progress', allStudents['in-progress']);
        updateTabCounts();
    } catch (error) {
        console.error('[SpecialistAssessment] Error accepting request:', error);
        showError('Failed to accept assessment request. Please try again.');
    }
}

/**
 * Start or continue assessment for a student
 * (used for in-progress / completed cards)
 */
function startAssessment(childId, childName) {
    console.log(
        '[SpecialistAssessment] Starting assessment for child:',
        childId,
        childName
    );

    window.location.href = `${BASE_URL}/html/specialist-assessment-form.html?child_id=${childId}`;
}

/**
 * View student profile
 */
function viewStudentProfile(childId) {
    console.log('[SpecialistAssessment] Viewing profile for child:', childId);

    Storage.set('currentChildId', childId);

    window.location.href = `${BASE_URL}/html/parent-dashboard.html?child_id=${childId}`;
}

/**
 * Format date string
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';

    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        });
    } catch (error) {
        console.error('[SpecialistAssessment] Error formatting date:', error);
        return dateString;
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text == null ? '' : String(text);
    return div.innerHTML;
}

/**
 * Show error message
 */
function showError(message) {
    console.error('[SpecialistAssessment] Error:', message);
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';

    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

/**
 * Show success message
 */
function showSuccess(message) {
    console.log('[SpecialistAssessment] Success:', message);
    const successDiv = document.getElementById('successMessage');
    successDiv.textContent = message;
    successDiv.style.display = 'block';

    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 5000);
}
