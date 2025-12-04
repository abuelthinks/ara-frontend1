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
    
    // Load students
    loadAssessmentStudents();
});

/**
 * Display current user information
 */
function displayUserInfo() {
    const currentUser = Auth.getCurrentUser();
    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.first_name || currentUser.username || 'Specialist';
    }
}

/**
 * Load all students with their assessment statuses
 */
async function loadAssessmentStudents() {
    try {
        console.log('[SpecialistAssessment] Fetching students...');
        
        // Fetch all children
        const childrenResponse = await API.get('/children/');
        console.log('[SpecialistAssessment] Children response:', childrenResponse);
        
        const children = Array.isArray(childrenResponse) ? childrenResponse : childrenResponse.results || [];
        
        if (!children || children.length === 0) {
            console.warn('[SpecialistAssessment] No children found');
            displayEmptyState('for-assessment');
            displayEmptyState('in-progress');
            displayEmptyState('completed');
            return;
        }
        
        console.log(`[SpecialistAssessment] Found ${children.length} children`);
        
        // Fetch assessments for each child
        const assessmentsByStatus = {
            'for-assessment': [],
            'in-progress': [],
            'completed': []
        };
        
        for (const child of children) {
            try {
                // Fetch assessments for this child
                const assessmentsResponse = await API.get(`/assessments/?child=${child.id}`);
                const assessments = Array.isArray(assessmentsResponse) ? assessmentsResponse : assessmentsResponse.results || [];
                
                console.log(`[SpecialistAssessment] Assessments for child ${child.id}:`, assessments);
                
                // Determine status
                let status = 'for-assessment'; // Default: no assessment yet
                let latestAssessment = null;
                
                if (assessments.length > 0) {
                    // Get latest assessment
                    latestAssessment = assessments.sort((a, b) => 
                        new Date(b.created_at) - new Date(a.created_at)
                    )[0];
                    
                    // Determine status based on assessment status field
                    if (latestAssessment.status === 'completed') {
                        status = 'completed';
                    } else if (latestAssessment.status === 'in_progress') {
                        status = 'in-progress';
                    } else {
                        status = 'for-assessment';
                    }
                }
                
                // Create student object
                const studentData = {
                    id: child.id,
                    name: child.name,
                    grade: child.grade_level || 'N/A',
                    dateOfBirth: child.date_of_birth ? formatDate(child.date_of_birth) : 'N/A',
                    medicalAlerts: child.medical_alerts || 'None',
                    status: status,
                    assessmentId: latestAssessment ? latestAssessment.id : null,
                    assessmentDate: latestAssessment ? formatDate(latestAssessment.created_at) : null,
                };
                
                assessmentsByStatus[status].push(studentData);
            } catch (error) {
                console.error(`[SpecialistAssessment] Error fetching assessments for child ${child.id}:`, error);
                // Still add the student but without assessment data
                const studentData = {
                    id: child.id,
                    name: child.name,
                    grade: child.grade_level || 'N/A',
                    dateOfBirth: child.date_of_birth ? formatDate(child.date_of_birth) : 'N/A',
                    medicalAlerts: child.medical_alerts || 'None',
                    status: 'for-assessment',
                    assessmentId: null,
                    assessmentDate: null,
                };
                assessmentsByStatus['for-assessment'].push(studentData);
            }
        }
        
        // Store all students for filtering
        allStudents = assessmentsByStatus;
        
        // Display students by status
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
    document.getElementById('forAssessmentCount').textContent = allStudents['for-assessment'].length;
    document.getElementById('inProgressCount').textContent = allStudents['in-progress'].length;
    document.getElementById('completedCount').textContent = allStudents['completed'].length;
}

/**
 * Display students in a tab
 */
function displayStudents(tabId, students) {
    const container = document.getElementById(tabId + 'List');
    
    if (!students || students.length === 0) {
        displayEmptyState(tabId);
        return;
    }
    
    container.innerHTML = students.map(student => createStudentCard(student)).join('');
}

/**
 * Create a student card HTML element
 */
function createStudentCard(student) {
    const statusText = {
        'for-assessment': 'Pending Assessment',
        'in-progress': 'In Progress',
        'completed': 'Completed'
    }[student.status] || 'Pending';
    
    const statusClass = {
        'for-assessment': 'status-pending',
        'in-progress': 'status-in-progress',
        'completed': 'status-completed'
    }[student.status] || 'status-pending';
    
    const actionButtonText = {
        'for-assessment': 'Start Assessment',
        'in-progress': 'Continue Assessment',
        'completed': 'View Assessment'
    }[student.status] || 'Start Assessment';
    
    return `
        <div class="student-card" data-name="${escapeHtml(student.name)}" data-grade="${escapeHtml(student.grade)}">
            <div class="student-header">
                <div class="student-name">${escapeHtml(student.name)}</div>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            
            <div class="student-info">
                <div class="info-item">
                    <span class="info-label">Grade</span>
                    <span class="info-value">${escapeHtml(student.grade)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Date of Birth</span>
                    <span class="info-value">${escapeHtml(student.dateOfBirth)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Medical Alerts</span>
                    <span class="info-value">${escapeHtml(student.medicalAlerts)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Last Assessment</span>
                    <span class="info-value">${student.assessmentDate || 'Never'}</span>
                </div>
            </div>
            
            <div class="student-actions">
                <button class="btn btn-primary" onclick="startAssessment(${student.id}, '${escapeHtml(student.name)}')">
                    ${actionButtonText}
                </button>
                <button class="btn btn-secondary" onclick="viewStudentProfile(${student.id})">
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
    const emptyMessages = {
        'for-assessment': {
            icon: '📚',
            title: 'No Students Ready',
            message: 'No students assigned for assessment at this time. Check back later or contact your administrator.'
        },
        'in-progress': {
            icon: '⏳',
            title: 'No Assessments In Progress',
            message: 'Start assessing a student to see their progress here.'
        },
        'completed': {
            icon: '✅',
            title: 'No Completed Assessments',
            message: 'Complete assessments will appear here.'
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
    
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active from all buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabId).classList.add('active');
    
    // Add active to clicked button
    event.target.classList.add('active');
    
    // Clear search on tab switch
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
    const searchTerm = searchInput.value.toLowerCase();
    const cards = document.querySelectorAll(`#${tabId}List .student-card`);
    
    let visibleCount = 0;
    
    cards.forEach(card => {
        const name = card.getAttribute('data-name').toLowerCase();
        const grade = card.getAttribute('data-grade').toLowerCase();
        
        if (name.includes(searchTerm) || grade.includes(searchTerm)) {
            card.style.display = '';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show empty state if no results
    const container = document.getElementById(tabId + 'List');
    if (visibleCount === 0 && allStudents[tabId].length > 0) {
        const emptyCard = container.querySelector('.empty-state');
        if (!emptyCard) {
            const div = document.createElement('div');
            div.className = 'empty-state';
            div.innerHTML = `
                <div class="empty-state-icon">🔍</div>
                <div class="empty-state-title">No Results Found</div>
                <div class="empty-state-message">No students match your search: "${escapeHtml(searchTerm)}"</div>
            `;
            container.appendChild(div);
        }
    }
}

/**
 * Start or continue assessment for a student
 */
function startAssessment(childId, childName) {
    console.log('[SpecialistAssessment] Starting assessment for child:', childId, childName);
    
    // Redirect to assessment form with child ID
    window.location.href = `${BASE_URL}/html/specialist-assessment-form.html?child_id=${childId}`;
}

/**
 * View student profile
 */
function viewStudentProfile(childId) {
    console.log('[SpecialistAssessment] Viewing profile for child:', childId);
    
    // Store child ID in session storage for profile page
    Storage.set('currentChildId', childId);
    
    // Redirect to child profile page
    window.location.href = `${BASE_URL}/html/parent-dashboard.html?child_id=${childId}`;
}

/**
 * Format date string (YYYY-MM-DD -> DD/MM/YYYY or similar)
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
    div.textContent = text;
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
    
    // Auto-hide after 5 seconds
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
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 5000);
}
