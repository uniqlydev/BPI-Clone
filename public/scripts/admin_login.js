

// Function to set error message
const setError = (element, message) => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');

    errorDisplay.innerText = message;
    inputControl.classList.add('error');
    inputControl.classList.remove('success');
};

// Function to set success message
const setSuccess = element => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');

    errorDisplay.innerText = '';
    inputControl.classList.add('success');
    inputControl.classList.remove('error');
};

// Function to validate inputs
const validateInputs = () => {
    const username = document.getElementById('admin_user');
    const password = document.getElementById('admin_pass');

    const valid_username = username.value.trim();
    const valid_password = password.value.trim();

    let isValid = true;

    // Username Validation
    if (valid_username === '') {
        setError(username, 'Please provide a valid username');
        isValid = false;
    } else {
        setSuccess(username);
    }

    // Password Validation
    if (valid_password === '') {
        setError(password, 'Password cannot be blank');
        isValid = false;
    } else {
        setSuccess(password);
    }

    return isValid;
};

document.addEventListener('DOMContentLoaded', () => {
    const adminLoginForm = document.getElementById('adminLoginForm');

    adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (validateInputs()) {
            // Send login request
            const username = document.getElementById('admin_user').value;
            const password = document.getElementById('admin_pass').value;

            const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

            fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            }).then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    setError(document.getElementById('admin_user'), 'Invalid username or password');
                    setError(document.getElementById('admin_pass'), 'Invalid username or password');
                }
            }).then(data => {
                console.log(data);
                window.location.href = '/admin/dashboard';
            }).catch(error => {
                console.log(error);
            });
        }
    });
});
