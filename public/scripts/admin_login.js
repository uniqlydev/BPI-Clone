const setError = (element, message) => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.errorDisplay');

    errorDisplay.innerText = message;
    inputControl.classList.add('error');
    inputControl.classList.remove('success');
};

const setSuccess = (element) => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.errorDisplay');

    errorDisplay.innerText = '';
    inputControl.classList.add('success');
    inputControl.classList.remove('error');
};

const validateInputs = () => {
    const admin_user = document.getElementById('admin_user');
    const admin_pass = document.getElementById('admin_pass');
    
    const valid_username = admin_user.value.trim();
    const valid_password = admin_pass.value.trim();

    let isValid = true;

    // Username Validation
    if (valid_username === '') {
        setError(admin_user, 'Username cannot be blank');
        isValid = false;
    } else if (!isValidUsername(valid_username)){
        setError(admin_user, "Please provide a valid username");
        isValid = false;
    } else {
        setSuccess(admin_user);
    }

    // Password Validation
    if (valid_password === '') {
        setError(admin_pass, 'Password cannot be blank');
        isValid = false;
    } else if(!isValidPassword(valid_password)){
        setError(admin_pass, "Invalid Password");
        isValid = false;
    } else {
        setSuccess(admin_pass);
    }

    return isValid;
};

const isValidUsername = (username) => {
    const re = /^[a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/;
    return re.test(String(username));
};

const isValidPassword = (password) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*_])[A-Za-z\d@$!%*_]{12,16}$/;
    return re.test(String(password));
};

document.addEventListener('DOMContentLoaded', () => {
    const adminLoginForm = document.getElementById('adminLoginForm');
    const admin_submit = document.getElementById('admin_submit');

    admin_submit.addEventListener('click', async (e) => {
        e.preventDefault();

        console.log('Submit button clicked');

        if (validateInputs()) {
            const admin_user = document.getElementById('admin_user').value;
            const admin_pass = document.getElementById('admin_pass').value;

            console.log('Inputs validated, sending fetch request');

            try {
                const response = await fetch('/api/admin/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: admin_user,
                        password: admin_pass
                    })
                });

                console.log('Fetch request sent, response received');

                if (response.ok) {
                    console.log('Login successful, redirecting to dashboard');
                    window.location.href = '/admin/dashboard';
                } else {
                    const errorText = await response.text();
                    alert('Login failed: ' + errorText);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Login failed. Please check your credentials and try again.');
            }
        } else {
            alert('Please fill in all fields correctly.');
        }
    });
});
