    window.onload = function() {
        // Require authenticated parent via shared Auth helper if available
        if (window.Auth && typeof Auth.requireRole === 'function') {
            const ok = Auth.requireRole('PARENT');
            if (!ok) return;
        }

        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (window.Auth && typeof Auth.logout === 'function') {
                    Auth.logout();
                } else {
                    sessionStorage.clear();
                    window.location.href = '../html/login.html';
                }
            });
        }
    };

    function generateRandomFileName() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 10; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result + '.html';
    }

    async function handleFormSubmission(e) {
        e.preventDefault();
        
        // Show loading state on button
        const submitBtn = document.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        
        const form = document.getElementById('assessmentForm');
        const formData = new FormData(form);
        const data = {};
        
        // Convert FormData to object (single-value fields)
        for (let [key, value] of formData.entries()) {
            if (!data[key]) {
                data[key] = value;
            } else {
                // If multiple values share the same name, store as array
                if (!Array.isArray(data[key])) {
                    data[key] = [data[key]];
                }
                data[key].push(value);
            }
        }

        // Structured medical conditions based on optional known conditions
        data.medicalConditions = {
            autism: document.getElementById('autism')?.checked || false,
            speechDelay: document.getElementById('speechDelay')?.checked || false,
            adhd: document.getElementById('adhd')?.checked || false,
            learningDifficulty: document.getElementById('learningDifficulty')?.checked || false,
            developmentalDelay: document.getElementById('developmentalDelay')?.checked || false,
            sensoryDifficulty: document.getElementById('sensoryDifficulty')?.checked || false,
            otherCondition: document.getElementById('otherCondition')?.checked || false,
            conditionNotSure: document.getElementById('conditionNotSure')?.checked || false,
            otherConditionDetail: document.querySelector('input[name="otherConditionDetail"]')?.value || ''
        };

        // Structured areas of concern
        data.areasOfConcern = {
            communication: document.getElementById('concernCommunication')?.checked || false,
            learning: document.getElementById('concernLearning')?.checked || false,
            motor: document.getElementById('concernMotor')?.checked || false,
            social: document.getElementById('concernSocial')?.checked || false,
            behavior: document.getElementById('concernBehavior')?.checked || false,
            emotions: document.getElementById('concernEmotions')?.checked || false,
            sensory: document.getElementById('concernSensory')?.checked || false,
            dailyLiving: document.getElementById('concernDailyLiving')?.checked || false,
            safety: document.getElementById('concernSafety')?.checked || false,
            notSure: document.getElementById('concernNotSure')?.checked || false
        };

        try {
            // Store form data in sessionStorage for summary page
            sessionStorage.setItem('formData', JSON.stringify(data));

            // Save to backend via shared API wrapper, if available
            if (window.API && window.CONFIG) {
                const payload = {
                    source: 'PARENT',
                    data,
                };
                await API.post(CONFIG.ENDPOINTS.ASSESSMENTS, payload);
            }

            // Redirect to submitted summary page regardless of backend state
            window.location.href = '../html/parent-submitted.html';
        } catch (error) {
            console.error('Error submitting assessment:', error);
            alert(error.message || 'Error submitting assessment. Please try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Assessment';
        }
    }

    // Add event listener to form
    document.getElementById('assessmentForm').addEventListener('submit', handleFormSubmission);

    // Update progress bar as user fills form
    const form = document.querySelector('form');
    const inputs = form.querySelectorAll('input, select, textarea');
    const progressBar = document.getElementById('formProgress');

    function updateProgress() {
        const total = inputs.length;
        const filled = Array.from(inputs).filter(input => {
            if (input.type === 'radio' || input.type === 'checkbox') {
                return input.checked;
            }
            return input.value.trim() !== '';
        }).length;
        
        const progress = (filled / total) * 100;
        progressBar.style.width = `${progress}%`;
    }

    inputs.forEach(input => {
        input.addEventListener('change', updateProgress);
        input.addEventListener('input', updateProgress);
    });

    function generateReport(formData) {
        const fileName = generateRandomFileName();
        let reportContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Child Assessment Report</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
                    .section { margin-bottom: 20px; }
                    .section-title { color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 5px; }
                    .field { margin: 10px 0; }
                    .label { font-weight: bold; }
                </style>
            </head>
            <body>
                <h1>Child Assessment Report</h1>
                <div class="section">
        `;

        // Convert form data to HTML
        for (let [key, value] of formData.entries()) {
            if (value) {  // Only include fields that have values
                reportContent += `
                    <div class="field">
                        <span class="label">${key}:</span>
                        <span class="value">${value}</span>
                    </div>`;
            }
        }

        reportContent += `
                </div>
                <footer>
                    <p>Generated on: ${new Date().toLocaleString()}</p>
                </footer>
            </body>
            </html>`;

        // Create and download the file
        const blob = new Blob([reportContent], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    function checkSectionCompletion(section) {
        const inputs = section.querySelectorAll('input, select, textarea');
        const required = section.querySelectorAll('[required]');
        let isComplete = true;

        required.forEach(input => {
            if (!input.value) isComplete = false;
        });

        if (isComplete) {
            section.classList.add('completed');
        } else {
            section.classList.remove('completed');
        }
    }

    // Add completion check to each form section
    document.querySelectorAll('.form-section').forEach(section => {
        // Add completion indicator
        const indicator = document.createElement('i');
        indicator.className = 'fas fa-check-circle completion-indicator';
        section.appendChild(indicator);

        // Monitor inputs in section
        const inputs = section.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('change', () => checkSectionCompletion(section));
            input.addEventListener('input', () => checkSectionCompletion(section));
        });
    });

    // Character counter functionality
    document.querySelectorAll('textarea').forEach(textarea => {
        const counter = textarea.parentElement.querySelector('.character-count');
        
        if (counter) {
            textarea.addEventListener('input', () => {
                const remaining = textarea.maxLength - textarea.value.length;
                counter.textContent = `${textarea.value.length}/${textarea.maxLength} characters`;
            });
        }
    });

    // Suggestion chips functionality
    document.querySelectorAll('.suggestion-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const textarea = chip.closest('.input-card').querySelector('textarea');
            const chipText = chip.textContent;
            
            if (textarea.value) {
                textarea.value += ', ' + chipText.toLowerCase();
            } else {
                textarea.value = chipText.toLowerCase();
            }
            
            // Trigger character counter update
            textarea.dispatchEvent(new Event('input'));
        });
    });

