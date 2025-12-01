function submitProgress() {
    // Basic validation
    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    
    if (!name || !age) {
        alert('Please fill in all required fields');
        return;
    }

    // Show loading state
    const submitBtn = document.querySelector('.submit-btn');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;

    // Simulate submission (replace with actual submission logic)
    setTimeout(() => {
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Submitted Successfully!';
        submitBtn.style.background = '#4CAF50';
        
        // Reset button after 2 seconds
        setTimeout(() => {
            submitBtn.innerHTML = originalContent;
            submitBtn.style.background = '#6B48FF';
            submitBtn.disabled = false;
        }, 2000);
    }, 1500);
}

let goalCount = 0;

function addGoal() {
    goalCount++;
    const goalContainer = document.getElementById('goals-container');
    
    const goalSection = document.createElement('div');
    goalSection.className = 'goal-section';
    goalSection.innerHTML = `
        <h4>Goal ${goalCount}</h4>
        <div class="form-group">
            <label>Goal:</label>
            <input type="text" placeholder="Enter goal">
        </div>
        <div class="form-group">
            <label>Objective:</label>
            <input type="text" placeholder="Enter objective">
        </div>
        <div class="form-group">
            <label>Progress:</label>
            <textarea placeholder="Enter progress"></textarea>
        </div>
        <button class="remove-btn" onclick="removeGoal(this)">Remove</button>
    `;
    
    goalContainer.appendChild(goalSection);
}

function removeGoal(button) {
    button.parentElement.remove();
    // Optionally renumber remaining goals
    updateGoalNumbers();
}

function updateGoalNumbers() {
    const goals = document.querySelectorAll('.goal-section h4');
    goals.forEach((goal, index) => {
        goal.textContent = `Goal ${index + 1}`;
    });
    goalCount = goals.length;
}

// Add first goal automatically
window.onload = function() {
    addGoal();
}

