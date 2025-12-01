window.onload = async function() {
    const userStatus = sessionStorage.getItem('userStatus');
    if (!userStatus || userStatus !== 'Parent') {
        window.location.href = '../html/login.html';
        return;
    }
    
    await loadSavedReports();
}

async function loadSavedReports() {
    try {
        const response = await fetch('../get_reports.php');
        const reports = await response.json();
        
        const container = document.getElementById('reportsContainer');
        container.innerHTML = ''; // Clear existing content

        reports.forEach(report => {
            const reportElement = createReportElement(report);
            container.appendChild(reportElement);
        });
    } catch (error) {
        console.error('Error loading reports:', error);
        alert('Error loading saved reports');
    }
}

function createReportElement(report) {
    const div = document.createElement('div');
    div.className = 'report-item';
    div.innerHTML = `
        <div class="report-info">
            <i class="fas fa-file-alt report-icon"></i>
            <div class="report-details">
                <h3>${report.childName}</h3>
                <p>Submitted on: ${new Date(report.submissionDate).toLocaleDateString()}</p>
            </div>
        </div>
        <div class="action-buttons">
            <button class="action-btn view-btn" onclick="viewReport(${report.id})">
                <i class="fas fa-eye"></i> View
            </button>
            <button class="action-btn delete-btn" onclick="deleteReport(${report.id})">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    return div;
}

async function viewReport(reportId) {
    try {
        const response = await fetch(`../get_report.php?id=${reportId}`);
        const report = await response.json();
        
        // Store report data and redirect to view page
        sessionStorage.setItem('viewReport', JSON.stringify(report));
        window.location.href = 'view-report.html';
    } catch (error) {
        console.error('Error viewing report:', error);
        alert('Error loading report details');
    }
}

async function deleteReport(reportId) {
    if (!confirm('Are you sure you want to delete this report?')) {
        return;
    }

    try {
        const response = await fetch('../delete_report.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: reportId })
        });
        
        const result = await response.json();
        if (result.success) {
            await loadSavedReports(); // Reload the list
        } else {
            alert('Error deleting report');
        }
    } catch (error) {
        console.error('Error deleting report:', error);
        alert('Error deleting report');
    }
}

function logout() {
    sessionStorage.clear();
    window.location.href = '../html/login.html';
}

