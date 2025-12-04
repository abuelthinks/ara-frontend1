// Assessment Generator - Admin

window.addEventListener('load', () => {
    // 1) Require ADMIN role (change to requireAnyRole(['ADMIN','SPECIALIST']) if needed)
    if (window.Auth && typeof Auth.requireRole === 'function') {
        const ok = Auth.requireRole('ADMIN');
        if (!ok) {
            return; // requireRole already redirected
        }
    }

    // 2) Attach progress listeners after DOM is ready
    const fields = document.querySelectorAll('input, textarea');
    fields.forEach(el => {
        el.addEventListener('change', updateProgress);
        el.addEventListener('input', updateProgress);
    });

    updateProgress(); // initial state
});

// ---------------------------------------
// Progress bar
// ---------------------------------------
function updateProgress() {
    const fields = Array.from(document.querySelectorAll('input, textarea'));
    if (!fields.length) return;

    const filled = fields.filter(field => {
        if (field.type === 'radio') {
            const group = document.querySelectorAll(`input[type="radio"][name="${field.name}"]`);
            // count group as filled if any radio is checked
            return Array.from(group).some(r => r.checked);
        }
        return field.value && field.value.trim() !== '';
    }).length;

    const progress = Math.min(100, (filled / fields.length) * 100);
    const bar = document.getElementById('formProgress');
    if (bar) {
        bar.style.width = progress + '%';
    }
}

// ---------------------------------------
// Generate Assessment (POST scaffold)
// ---------------------------------------
async function generateAssessment() {
    if (!window.API || !window.CONFIG) {
        alert('API not available. Check that config.js and api.js are loaded.');
        return;
    }

    const payload = collectFormData();

    try {
        // Assumes POST /api/assessments/ accepts JSON body.
        // Adjust keys to match your Assessment serializer.
        const result = await API.post(CONFIG.ENDPOINTS.ASSESSMENTS, payload);

        console.log('[Assessment] Created:', result);
        alert('Assessment data sent to backend successfully.');

        // TODO: once you add a generate/download endpoint,
        // you can redirect using result.id, e.g.:
        // window.location.href = `${BASE_URL}/html/assessment-view.html?id=${result.id}`;
    } catch (error) {
        console.error('[Assessment] Error:', error);
        alert('Failed to generate assessment: ' + (error.message || 'Unknown error'));
    }
}

// ---------------------------------------
// Shareable link (placeholder for future)
// ---------------------------------------
async function createShareableLink() {
    alert('Shareable link feature will be wired once the backend endpoint is ready.');
    // Example for later:
    // const assessmentId = ...;
    // await API.post(`/assessments/${assessmentId}/share-link/`, {});
    // show result.share_url from the response.
}

// ---------------------------------------
// Form data collection
// ---------------------------------------
function collectFormData() {
    const inputs = Array.from(document.querySelectorAll('input, textarea'));

    // Generic capture: list of { name, label, value }
    const answers = [];

    inputs.forEach((el, index) => {
        if (el.type === 'radio') {
            // Only capture checked radios, grouped by name
            if (!el.checked) return;
        } else if (!el.value || el.value.trim() === '') {
            return;
        }

        const labelText = findLabelText(el);
        const entry = {
            index,
            name: el.name || el.placeholder || el.type || `field_${index}`,
            label: labelText,
            value: el.type === 'radio' ? el.value || 'selected' : el.value.trim(),
        };
        answers.push(entry);
    });

    return {
        // Wrap in a single object; backend can map or store as JSON.
        raw_answers: answers,
    };
}

function findLabelText(el) {
    // 1) <label for="id">
    if (el.id) {
        const forLabel = document.querySelector(`label[for="${el.id}"]`);
        if (forLabel && forLabel.textContent) {
            return forLabel.textContent.trim();
        }
    }

    // 2) Parent <label> wrapping the input
    if (el.closest && el.closest('label')) {
        return el.closest('label').textContent.replace(/\s+/g, ' ').trim();
    }

    // 3) Previous sibling text node or <p>
    let prev = el.previousElementSibling;
    if (prev && (prev.tagName === 'P' || prev.tagName === 'SPAN')) {
        return prev.textContent.trim();
    }

    return '';
}

// ---------------------------------------
// Navigation helper
// ---------------------------------------
function goToAdminDashboard() {
    const base = window.BASE_URL || '';
    window.location.href = `${base}/html/admin-dashboard.html`;
}
