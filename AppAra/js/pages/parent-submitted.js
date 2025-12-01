window.onload = function() {
    // Get form data from sessionStorage
    const formData = JSON.parse(sessionStorage.getItem('formData'));
    if (!formData) {
        window.location.href = '../html/parent-dashboard.html';
        return;
    }

    const formSummary = document.getElementById('formSummary');
    
    // Create sections and populate with data
    const sections = {
        'Background Information': [
            'childFirstName',
            'childLastName',
            'dob',
            'gender',
            'parentName',
            'phone',
            'email'
        ],
        'Medical Information': [
            'medicalNone',
            'medicalYes',
            'medicalDetails',
            'medicalConditions'
        ],
        'Areas of Concern': ['areasOfConcern'],
        'Parent Input': [
            'goalCommunicateBetter',
            'goalImproveBehavior',
            'goalLearnFaster',
            'goalImproveSocial',
            'goalBeIndependent',
            'goalSchoolReadiness',
            'goalMotorImprovements',
            'goalOtherDetail'
        ]
    };

    for (const [sectionTitle, fields] of Object.entries(sections)) {
        const section = document.createElement('div');
        section.className = 'section';
        
        const title = document.createElement('h2');
        title.className = 'section-title';
        title.textContent = sectionTitle;
        section.appendChild(title);

        fields.forEach(field => {
            if (formData[field]) {
                const fieldDiv = document.createElement('div');
                fieldDiv.className = 'field';
                
                const label = document.createElement('span');
                label.className = 'label';
                label.textContent = field.replace(/([A-Z])/g, ' $1').toLowerCase() + ': ';
                
                const value = document.createElement('span');
                value.className = 'value';
                value.textContent = typeof formData[field] === 'object' 
                    ? JSON.stringify(formData[field]) 
                    : formData[field];
                
                fieldDiv.appendChild(label);
                fieldDiv.appendChild(value);
                section.appendChild(fieldDiv);
            }
        });

        formSummary.appendChild(section);
    }
};

