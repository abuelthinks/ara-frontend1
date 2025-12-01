const form = document.getElementById('personalForm');
const preview = document.getElementById('preview');

form.addEventListener('input', function() {
    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;

    document.getElementById('previewName').textContent = name;
    document.getElementById('previewAge').textContent = age;
    document.getElementById('previewGender').textContent = gender;

    preview.style.display = 'block';
});

