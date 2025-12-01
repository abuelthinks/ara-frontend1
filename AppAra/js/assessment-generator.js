// Update progress bar as user fills form
document.querySelectorAll('input, textarea').forEach(element => {
    element.addEventListener('change', updateProgress);
});

function updateProgress() {
    const totalFields = document.querySelectorAll('input, textarea').length;
    const filledFields = Array.from(document.querySelectorAll('input, textarea'))
        .filter(field => field.value.trim() !== '').length;
    const progress = (filledFields / totalFields) * 100;
    document.getElementById('formProgress').style.width = progress + '%';
}

function generateAssessment() {
    // Add logic to generate and download assessment
    alert('Generating assessment...');
}

function createShareableLink() {
    // Add logic to create shareable link
    alert('Creating shareable link...');
}

function addOtherSkill() {
    const table = document.getElementById('academic-skills-table');
    const newRow = table.insertRow(-1);
    
    // Create cells
    const skillName = prompt('Enter skill name:');
    if (!skillName) return;
    
    const cells = [
        skillName,
        '<input type="radio" name="other-academic-' + Date.now() + '">',
        '<input type="radio" name="other-academic-' + Date.now() + '">',
        '<input type="radio" name="other-academic-' + Date.now() + '">',
        '<input type="radio" name="other-academic-' + Date.now() + '">'
    ];
    
    cells.forEach((html, index) => {
        const cell = newRow.insertCell(index);
        if (index === 0) {
            cell.textContent = html;
        } else {
            cell.innerHTML = html;
        }
    });
}

function removeRow(button) {
    const row = button.closest('tr');
    row.remove();
}

