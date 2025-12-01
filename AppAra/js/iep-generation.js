// Check if user is logged in and is an admin
window.onload = function() {
    const userStatus = sessionStorage.getItem('userStatus');
    if (!userStatus || userStatus !== 'Admin') {
        window.location.href = '../html/login.html';
    }
};

document.getElementById('addGoalRow').addEventListener('click', function() {
    const table = document.getElementById('goalsTable');
    const newRow = table.insertRow(-1);
    
    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2);
    const cell4 = newRow.insertCell(3);
    
    cell1.innerHTML = '<input type="text" class="goal-input">';
    cell2.innerHTML = '<input type="text" class="objective-input">';
    cell3.innerHTML = '<input type="text" class="timeframe-input">';
    cell4.innerHTML = '<button type="button" class="remove-row-btn">Remove</button>';

    cell4.querySelector('.remove-row-btn').addEventListener('click', function() {
        table.deleteRow(newRow.rowIndex);
    });
});

document.querySelectorAll('.remove-row-btn').forEach(button => {
    button.addEventListener('click', function() {
        const row = button.parentElement.parentElement;
        row.parentElement.removeChild(row);
    });
});

// Add row functionality for activities table
document.getElementById('addActivityRow').addEventListener('click', function() {
    const table = document.getElementById('activitiesTable');
    const newRow = table.insertRow(-1);
    
    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2);
    const cell4 = newRow.insertCell(3);
    
    cell1.innerHTML = '<input type="text" class="goal-input">';
    cell2.innerHTML = '<input type="text" class="activity-input">';
    cell3.innerHTML = '<input type="text" class="frequency-input">';
    cell4.innerHTML = '<button type="button" class="remove-row-btn">Remove</button>';

    cell4.querySelector('.remove-row-btn').addEventListener('click', function() {
        table.deleteRow(newRow.rowIndex);
    });
});

// Add event listeners to existing remove buttons in activities table
document.querySelectorAll('#activitiesTable .remove-row-btn').forEach(button => {
    button.addEventListener('click', function() {
        const row = button.parentElement.parentElement;
        row.parentElement.removeChild(row);
    });
});

