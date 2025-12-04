/**
 * Teacher Dashboard - Assessment Form
 * Loads via Auth.requireRole('TEACHER')
 * Submits to POST /api/teacher-inputs/
 */

// ============================================
// 1. AUTH & LOAD
// ============================================

window.onload = async function() {
    // Require authenticated teacher via shared Auth helper
    if (window.Auth && typeof Auth.requireRole === 'function') {
        Auth.requireRole('TEACHER');
    } else {
        // Fallback: check sessionStorage (for testing without auth.js)
        const userStatus = sessionStorage.getItem('userStatus');
        const userEmail = sessionStorage.getItem('userEmail');
        
        if (userStatus !== 'TEACHER') {
            const base = window.BASE_URL || '';
            window.location.href = `${base}/html/login.html`;
            return;
        }
        document.getElementById('teacherEmail').textContent = userEmail || 'Teacher';
    }
    
    // If auth.js is present, display the logged-in user email
    if (window.Auth && typeof Auth.getUser === 'function') {
        const user = Auth.getUser();
        if (user && user.email) {
            document.getElementById('teacherEmail').textContent = user.email;
        }
    }
};


// ============================================
// 2. FORM SUBMISSION
// ============================================

async function submitForm(event) {
    event.preventDefault();
    
    const submitBtn = document.querySelector('.submit-btn');
    const loadingIcon = submitBtn.querySelector('.loading');
    const submitText = submitBtn.querySelector('span');
    const submitIcon = submitBtn.querySelector('.fa-paper-plane');
    
    // Show loading state
    submitBtn.disabled = true;
    loadingIcon.style.display = 'inline-block';
    submitIcon.style.display = 'none';
    submitText.textContent = 'Submitting...';

    try {
        // Build form data object from all inputs
        const formData = buildTeacherInputData();
        
        // Call POST /api/teacher-inputs/ via API wrapper
        if (window.API && typeof API.post === 'function') {
            const response = await API.post(
                CONFIG.ENDPOINTS.TEACHER_INPUTS || '/teacher-inputs/',
                formData
            );
            
            // Success
            alert('Assessment submitted successfully!');
            
            // Optional: redirect to submitted page after brief delay
            const base = window.BASE_URL || '';
            setTimeout(() => {
                window.location.href = `${base}/html/teacher-submitted.html`;
            }, 1500);
            
        } else {
            // Fallback: alert (testing without API.js)
            alert('Form data:\n' + JSON.stringify(formData, null, 2));
            
            // Reset button state for testing
            submitBtn.disabled = false;
            loadingIcon.style.display = 'none';
            submitIcon.style.display = 'inline-block';
            submitText.textContent = 'Submit Report';
        }
    } catch (error) {
        console.error('Submission error:', error);
        alert('Error submitting form: ' + (error.message || error));
        
        // Reset button state
        submitBtn.disabled = false;
        loadingIcon.style.display = 'none';
        submitIcon.style.display = 'inline-block';
        submitText.textContent = 'Submit Report';
    }
    
    return false;
}

// ============================================
// 3. BUILD FORM DATA
// ============================================

function buildTeacherInputData() {
    // SECTION A — Student Information
    const sectionA = {
        student_name: document.getElementById('studentName').value,
        dob: document.getElementById('dob').value,
        grade_level: document.getElementById('gradeLevel').value,
        teacher_name: document.getElementById('teacherName').value,
        assessment_date: document.getElementById('assessmentDate').value,
        primary_language: document.getElementById('primaryLanguage').value,
    };
    
    // SECTION B — Classroom Observation Summary
    const sectionB = {
        observation_context: getCheckboxValues('obsContext'),
        general_behavior: getCheckboxValues('generalBehavior'),
        general_behavior_notes: document.getElementById('generalBehaviorNotes').value,
    };
    
    // SECTION C — Academic Skills Screening
    const sectionC = {
        literacy: getCheckboxValues('literacy'),
        literacy_notes: document.getElementById('literacyNotes').value,
        numeracy: getCheckboxValues('numeracy'),
        numeracy_notes: document.getElementById('numeracyNotes').value,
        pre_academic: getCheckboxValues('preAcademic'),
        pre_academic_notes: document.getElementById('preAcademicNotes').value,
    };
    
    // SECTION D — Learning Behaviors
    const sectionD = {
        attention_focus: getCheckboxValues('attentionFocus'),
        attention_notes: document.getElementById('attentionNotes').value,
        task_completion: getCheckboxValues('taskCompletion'),
        task_completion_notes: document.getElementById('taskCompletionNotes').value,
    };
    
    // SECTION E — Social & Peer Interaction
    const sectionE = {
        social_skills: getCheckboxValues('socialSkills'),
        social_skills_notes: document.getElementById('socialSkillsNotes').value,
        play_skills: getCheckboxValues('playSkills'),
        play_skills_notes: document.getElementById('playSkillsNotes').value,
    };
    
    // SECTION F — Behavioral Observation
    const sectionF = {
        behavior_patterns: getCheckboxValues('behaviorPatterns'),
        behavior_patterns_notes: document.getElementById('behaviorPatternsNotes').value,
        emotional_regulation: getCheckboxValues('emotionalRegulation'),
        emotional_regulation_notes: document.getElementById('emotionalRegulationNotes').value,
    };
    
    // SECTION G — Learning Style & Support Needs
    const sectionG = {
        learning_style: getCheckboxValues('learningStyle'),
        class_supports: getCheckboxValues('classSupports'),
        class_supports_notes: document.getElementById('classSupportsNotes').value,
    };
    
    // SECTION H — Academic Modifications / Accommodations
    const sectionH = {
        accommodations: getCheckboxValues('accommodations'),
        accommodations_notes: document.getElementById('accommodationsNotes').value,
    };
    
    // SECTION I — SPED Teacher Summary & Recommendations
    const sectionI = {
        summary_findings: document.getElementById('summaryFindings').value,
        strengths: getCheckboxValues('strengths'),
        priority_needs: getCheckboxValues('priorityNeeds'),
        intervention_frequency: getCheckboxValues('interventionFrequency'),
        next_steps: getCheckboxValues('nextSteps'),
    };
    
    // Combine all sections into final payload
    const payload = {
        section_a: sectionA,
        section_b: sectionB,
        section_c: sectionC,
        section_d: sectionD,
        section_e: sectionE,
        section_f: sectionF,
        section_g: sectionG,
        section_h: sectionH,
        section_i: sectionI,
    };
    
    return payload;
}

// ============================================
// 4. HELPER: GET CHECKBOX VALUES
// ============================================

function getCheckboxValues(name) {
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    return Array.from(checkboxes).map(cb => cb.value);
}
