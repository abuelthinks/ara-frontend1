let goalCount = 1;

function addGoal() {
    goalCount++;
    const goalsContainer = document.getElementById('goalsContainer');
    const goalSection = document.createElement('div');
    goalSection.className = 'goal-section';
    goalSection.innerHTML = `
        <div class="goal-header">Goal ${goalCount}</div>
        <div class="goal-content">
            <div class="input-group">
                <label>Goal:</label>
                <input type="text" placeholder="Enter goal">
            </div>
            <div class="input-group">
                <label>Objective:</label>
                <input type="text" placeholder="Enter objective">
            </div>
            <div class="input-group">
                <label>Progress:</label>
                <textarea placeholder="Enter progress"></textarea>
            </div>
            <button class="remove-btn" onclick="removeGoal(this)">Remove</button>
        </div>
    `;
    goalsContainer.appendChild(goalSection);
}

function removeGoal(button) {
    const goalSection = button.closest('.goal-section');
    goalSection.remove();
    updateGoalNumbers();
}

function updateGoalNumbers() {
    const goalSections = document.querySelectorAll('.goal-section');
    goalSections.forEach((section, index) => {
        section.querySelector('.goal-header').textContent = `Goal ${index + 1}`;
    });
    goalCount = goalSections.length;
}

