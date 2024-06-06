const setError = (element, message) => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');

    errorDisplay.innerText = message;
    inputControl.classList.add('error');
    inputControl.classList.remove('success');
};

const setSuccess = element => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');

    errorDisplay.innerText = '';
    inputControl.classList.add('success');
    inputControl.classList.remove('error');
};

const validateInputs = () => {
    const first_name = document.getElementById('first_name');
    const last_name = document.getElementById('last_name');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmpassword');
    const mobile = document.getElementById('mobile');
    const email = document.getElementById('email');
    
    const valid_first_name = first_name.value.trim();
    const valid_last_name = last_name.value.trim();
    const valid_password = password.value.trim();
    const valid_confirmPassword = confirmPassword.value.trim();
    const valid_mobile_number = mobile.value.trim();
    const valid_email = email.value.trim();

    let isValid = true;

    // First Name Validation
    if(valid_first_name === '') {
        setError(first_name, 'First name cannot be blank');
        isValid = false;
    } else if (!isValidFirstName(valid_first_name)) {
        setError(first_name, "Provide a valid first name");
        isValid = false;
    } else {
         setSuccess(first_name);
    } 

    // Last Name Validation
    if (valid_last_name === '') {
        setError(last_name, 'Last name cannot be blank');
        isValid = false;
    } else if (!isValidLastName(valid_last_name)){
        setError(last_name, "Provide a valid last name");
        isValid = false;
    } else {
        setSuccess(last_name);
    }

    // Password Validation
    if (valid_password === '') {
        setError(password, 'Password cannot be blank');
        isValid = false;
    } else if(!isValidPassword(valid_password)){
        setError(password, "Password should contain at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special character, and must be 12-16 characters long");
        isValid = false;
    } else {
        setSuccess(password);
    }

    // Confirm Password Validation
    if (valid_confirmPassword === '') {
        setError(confirmPassword, 'Confirm Password cannot be blank');
        isValid = false;
    } else if (valid_password !== valid_confirmPassword) {
        setError(confirmPassword, 'Passwords do not match');
        isValid = false;
    } else {
        setSuccess(confirmPassword);
    }

    // Mobile Number Validation
    if (valid_mobile_number === '') {
        setError(mobile, 'Mobile number cannot be blank');
        isValid = false;
    } else if(!isValidMobileNumber(valid_mobile_number)){
        setError(mobile, "Provide a valid mobile number");
        isValid = false;
    } else {
        setSuccess(mobile);
    }

    // Email Validation
    if (valid_email === '') {
        setError(email, 'Email cannot be blank');
        isValid = false;
    } else {
        setSuccess(email);
    }

    return isValid;
};

const isValidFirstName = first_name => {
    const re = /^[A-Za-zÑñ  ]{1,30}$/;
    return re.test(String(first_name));
};

const isValidLastName = last_name => {
    const re = /^[A-Za-zÑñ  ]{1,30}$/;
    return re.test(String(last_name));
};

const isValidPassword = password => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*_])[A-Za-z\d@$!%*_]{12,16}$/;
    return re.test(String(password));
};

const isValidMobileNumber = mobile => {
    const re = /^(\+639\d{9}|^09\d{9})$/;
    return re.test(String(mobile));
}

const isValidEmail = email => {
    const re = /^[a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/;
    return re.test(String(email));
}

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const submitbtn = document.getElementById('submit');
    const first_name = document.getElementById('first_name');

    console.log(first_name.value)

    submitbtn.addEventListener('click', async (e) => {
        e.preventDefault();

        if (validateInputs() == true) {
            fetch('/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    first_name: first_name.value,
                    last_name: last_name.value,
                    password: password.value,
                    email:email.value,
                    phone_number: mobile.value
                })
            }).then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Something went wrong');
                }
            }).then(data => {
                console.log(data);
                window.location.href = '/';
            }).catch(error => {
                console.log(error);
            });
        }else {
            alert('Invalid Input');
        }
    });

});
