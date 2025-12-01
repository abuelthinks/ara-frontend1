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

// Simple in-browser "submit" (no backend PHP)
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

    // Store in sessionStorage for later viewing if needed
    try {
        sessionStorage.setItem('specialistAssessment', JSON.stringify(data));
    } catch (e) {
        console.warn('Could not store specialist assessment in sessionStorage', e);
    }

    alert('Assessment captured successfully (stored in browser).');
}

