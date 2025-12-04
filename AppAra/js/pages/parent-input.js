/**
 * Parent Input Form - Multi-Step Assessment
 * UPDATED: Auto-save drafts with 24-hour expiry
 * Shows one section at a time (A-I)
 * Collects all form data and submits on final section
 */

let childId = null;
let isEditMode = false;
let currentParentInputId = null;

// --- Edit Mode Detection & Pre-fill ---
async function initializeEditMode() {
    const params = new URLSearchParams(window.location.search);
    childId = params.get('childId');
    isEditMode = params.get('edit') === 'true';

    console.log(`[ParentInput] childId=${childId}, editMode=${isEditMode}`);

    // If edit mode, fetch saved data from backend
    if (isEditMode && childId) {
        await loadSavedDataFromBackend();
    }
}

// --- Fetch ParentInput data from backend for edit ---
async function loadSavedDataFromBackend() {
    try {
        console.log(`[ParentInput] Fetching saved data for childId=${childId}...`);
        
        // Fetch all parent inputs for this child, sorted by most recent
        const response = await API.get(`/parent-inputs/?child=${childId}`);
        const parentInputs = Array.isArray(response) ? response : response.results || [];

        if (parentInputs.length > 0) {
            const parentInput = parentInputs[0]; // Get most recent
            currentParentInputId = parentInput.id;
            
            console.log('[ParentInput] Loaded saved data from backend:', parentInput);

            // Pre-fill formData object with backend data
            Object.keys(parentInput).forEach(key => {
                if (key !== 'id' && key !== 'child' && key !== 'parent' && key !== 'created_at' && key !== 'updated_at') {
                    if (parentInput[key] !== null) {
                        formData[key] = parentInput[key];
                    }
                }
            });

            // Pre-fill form fields with data
            preFillFormFields(parentInput);
            
            console.log('[ParentInput] Form pre-filled with backend data');
        } else {
            console.log('[ParentInput] No saved data found for child:', childId);
        }
    } catch (error) {
        console.error('[ParentInput] Error loading saved data from backend:', error);
    }
}

// --- Pre-fill all form fields with saved data ---
function preFillFormFields(data) {
    // Iterate through all form fields and populate from data object
    document.querySelectorAll('input, textarea, select').forEach(input => {
        const fieldName = input.name;
        
        if (!fieldName || !data[fieldName]) return;

        if (input.type === 'checkbox') {
            // Handle checkboxes (multi-select)
            const savedValue = data[fieldName];
            const valuesToCheck = Array.isArray(savedValue) ? savedValue : [savedValue];
            if (valuesToCheck.includes(input.value)) {
                input.checked = true;
            }
        } else if (input.type === 'radio') {
            // Handle radio buttons
            if (input.value === data[fieldName]) {
                input.checked = true;
            }
        } else {
            // Handle text inputs, textareas, selects
            input.value = data[fieldName];
        }
    });

    console.log('[ParentInput] All form fields pre-filled');
}


const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
let currentSectionIndex = 0;
const formData = {};

const DRAFT_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// --- Auth Check ---
window.onload = async function() {
    if (window.Auth && typeof Auth.requireRole === 'function') {
        const ok = Auth.requireRole('PARENT');
        if (!ok) return;
    }

    const user = Auth.getCurrentUser();
    if (user) {
        document.getElementById('parentEmail').textContent = user.email;
        // Pre-fill parent email
        const emailInput = document.getElementById('parentEmail');
        if (emailInput && emailInput.tagName === 'INPUT') {
            emailInput.value = user.email;
        }
    }

    setupLogout();
    renderProgressBar();
    showSection(0);
    loadSavedData();
};

// --- Progress Bar ---
function renderProgressBar() {
    const container = document.getElementById('progressContainer');
    container.innerHTML = '';

    SECTIONS.forEach((section, index) => {
        // Dot
        const dot = document.createElement('div');
        dot.className = `progress-dot ${index === currentSectionIndex ? 'active' : ''} ${index < currentSectionIndex ? 'completed' : ''}`;
        dot.textContent = section;
        container.appendChild(dot);

        // Line (except after last dot)
        if (index < SECTIONS.length - 1) {
            const line = document.createElement('div');
            line.className = `progress-line ${index < currentSectionIndex ? 'completed' : ''}`;
            container.appendChild(line);
        }
    });

    // Update progress text
    document.getElementById('progressText').textContent = `Section ${SECTIONS[currentSectionIndex]} of ${SECTIONS.length}`;
}

// --- Show/Hide Sections ---
function showSection(index) {
    // Hide all sections
    document.querySelectorAll('.form-section').forEach(el => {
        el.classList.remove('active');
    });

    // Show current section
    const section = document.querySelector(`.form-section[data-section="${SECTIONS[index]}"]`);
    if (section) {
        section.classList.add('active');
    }

    // Update buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (index === 0) {
        prevBtn.style.display = 'none';
        nextBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Next';
    } else if (index === SECTIONS.length - 1) {
        prevBtn.style.display = 'flex';
        nextBtn.innerHTML = '<i class="fas fa-check"></i> Submit';
    } else {
        prevBtn.style.display = 'flex';
        nextBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Next';
    }

    renderProgressBar();
    window.scrollTo(0, 0);
}

// --- Navigation ---
function previousSection() {
    if (currentSectionIndex > 0) {
        saveCurrentSectionData();
        currentSectionIndex--;
        showSection(currentSectionIndex);
    }
}

function nextSection() {
    saveCurrentSectionData();
    if (currentSectionIndex < SECTIONS.length - 1) {
        currentSectionIndex++;
        showSection(currentSectionIndex);
    }
}

// --- Save Section Data ---
function saveCurrentSectionData() {
    const section = SECTIONS[currentSectionIndex];
    const formElement = document.querySelector('form');
    const sectionElement = document.querySelector(`.form-section[data-section="${section}"]`);

    if (sectionElement) {
        const inputs = sectionElement.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                if (input.checked) {
                    if (!formData[input.name]) formData[input.name] = [];
                    if (Array.isArray(formData[input.name])) {
                        if (!formData[input.name].includes(input.value)) {
                            formData[input.name].push(input.value);
                        }
                    } else {
                        formData[input.name] = input.value;
                    }
                }
            } else if (input.value) {
                formData[input.name] = input.value;
            }
        });
    }

    // Save to localStorage WITH timestamp
    localStorage.setItem('parentInputDraft', JSON.stringify(formData));
    localStorage.setItem('parentInputDraftTime', Date.now().toString());
    
    console.log('[Draft] Auto-saved at:', new Date().toLocaleString());
}

// --- Load Saved Data ---
function loadSavedData() {
    const saved = localStorage.getItem('parentInputDraft');
    const savedTime = localStorage.getItem('parentInputDraftTime');
    
    if (saved && savedTime) {
        const now = Date.now();
        
        if ((now - parseInt(savedTime)) > DRAFT_EXPIRY) {
            // Draft expired
            console.log('[Draft] Draft expired (24+ hours), clearing');
            localStorage.removeItem('parentInputDraft');
            localStorage.removeItem('parentInputDraftTime');
            return;
        }
        
        try {
            const data = JSON.parse(saved);
            Object.keys(data).forEach(key => {
                const input = document.querySelector(`[name="${key}"]`);
                if (input) {
                    if (input.type === 'checkbox' || input.type === 'radio') {
                        document.querySelectorAll(`[name="${key}"]`).forEach(el => {
                            if (Array.isArray(data[key])) {
                                el.checked = data[key].includes(el.value);
                            } else {
                                el.checked = el.value === data[key];
                            }
                        });
                    } else {
                        input.value = data[key];
                    }
                }
            });
            console.log('[Draft] Loaded from:', new Date(parseInt(savedTime)).toLocaleString());
        } catch (e) {
            console.error('[Draft] Error loading saved data:', e);
        }
    }
}

// --- Form Submission (UPDATED for edit mode) ---
async function handleSectionSubmit(e) {
    e.preventDefault();

    // Save final section
    saveCurrentSectionData();

    // If not on last section, go to next
    if (currentSectionIndex < SECTIONS.length - 1) {
        nextSection();
        return;
    }

    // On final submission
    const submitBtn = document.getElementById('nextBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner"></span>';

    try {
        console.log('[Submit] Submitting form data...');
        
        let response;
        
        if (isEditMode && currentParentInputId) {
            // UPDATE existing ParentInput
            console.log('[Submit] Updating existing ParentInput ID:', currentParentInputId);
            response = await API.patch(`/parent-inputs/${currentParentInputId}/`, formData);
        } else {
            // CREATE new ParentInput
            const payload = {
                ...formData,
                child: childId // Include childId if available
            };
            console.log('[Submit] Creating new ParentInput with payload:', payload);
            response = await API.post('/parent-inputs/', payload);
        }

        if (response) {
            console.log('[Submit] Success! Response:', response);
            
            // Mark first login as complete
            localStorage.setItem('parentIsFirstLogin', 'false');
            
            // Clear saved draft - no longer needed
            localStorage.removeItem('parentInputDraft');
            localStorage.removeItem('parentInputDraftTime');

            // Show success message
            const message = isEditMode ? 'Assessment information updated successfully!' : 'Assessment information submitted successfully!';
            alert(message);

            // Redirect to dashboard
            const base = window.BASE_URL || '/AppAra';
            window.location.href = `${base}/html/parent/parent-dashboard.html`;
        }
    } catch (error) {
        console.error('[Submit] Submission error:', error);
        alert('Error submitting form. Please try again.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
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

// --- Back Button ---
function goBack() {
    const base = window.BASE_URL || '/AppAra';
    window.location.href = `${base}/html/parent/parent-dashboard.html`;
}

// Auto-save draft every 30 seconds while filling form
setInterval(() => {
    if (document.activeElement && 
        (document.activeElement.tagName === 'INPUT' || 
         document.activeElement.tagName === 'TEXTAREA' ||
         document.activeElement.tagName === 'SELECT')) {
        saveCurrentSectionData();
        console.log('[Auto-save] Draft saved automatically');
    }
}, 30000);