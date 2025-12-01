// Progress tracking
function updateProgress() {
    const totalFields = document.querySelectorAll('input, textarea').length;
    const filledFields = document.querySelectorAll(
        'input:checked, input[type="text"]:not(:placeholder-shown), textarea:not(:placeholder-shown)'
    ).length;
    const progress = totalFields ? (filledFields / totalFields) * 100 : 0;
    document.getElementById('progressBar').style.width = progress + '%';
}

// Attach listeners for progress updates
document.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('change', updateProgress);
    input.addEventListener('input', updateProgress);
});

// Simple submit using shared API wrapper when available
function submitAssessment() {
    const data = {};

    // Collect all text inputs and textareas
    document.querySelectorAll('input[type="text"], textarea').forEach(el => {
        data[el.id || el.name] = el.value;
    });

    // Collect all checkboxes (store as true/false)
    document.querySelectorAll('input[type="checkbox"]').forEach(el => {
        const key = el.id || el.name;
        if (key) {
            data[key] = el.checked;
        }
    });

    // Store in sessionStorage for local backup
    try {
        sessionStorage.setItem('specialistAssessment', JSON.stringify(data));
    } catch (e) {
        console.warn('Could not store specialist assessment in sessionStorage', e);
    }

    // Send to backend if shared API is available
    (async () => {
        try {
            if (window.API && window.CONFIG) {
                const payload = {
                    source: 'SPECIALIST',
                    data,
                };
                await API.post(CONFIG.ENDPOINTS.ASSESSMENTS, payload);
            }
            alert('Assessment submitted successfully.');
        } catch (err) {
            console.error('Error submitting specialist assessment:', err);
            alert(err.message || 'Error submitting assessment. Data is saved locally in this browser.');
        }
    })();
}

