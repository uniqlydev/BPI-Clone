"use strict";
const setError = (element, message) => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');
    errorDisplay.innerText = message;
    inputControl.classList.add('error');
    inputControl.classList.remove('success');
};
const valid_name = (first_name, last_name) => {
    const regex_checker = /^[A-Za-zÑñ ]{1,30}$/;
    if (first_name !== null && last_name !== null) {
        if (first_name.length > 0 && last_name.length > 0) {
            return false;
        }
        // Check if valid
        if (regex_checker.test(first_name) && regex_checker.test(last_name)) {
            return true;
        }
        else {
            return false;
        }
    }
    else {
        return false;
    }
};
const isValidPassword = (password) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*_])[A-Za-z\d@$!%*_]{12,16}$/;
    if (password.length < 8) {
        return false;
    }
    return re.test(password);
};
const isValidMobileNumber = (phone_number) => {
    const re = /^(\+639\d{9}|09\d{9})$/;
    if (phone_number.length < 11) {
        return false;
    }
    return re.test(phone_number);
};
const isValidEmail = (email) => {
    const re = /^[a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/;
    return re.test(email);
};
const isValidImage = (image) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
};
document.addEventListener('DOMContentLoaded', function () {
    // Check firstname and lastname
    const first_name = document.getElementById('first_name');
    const last_name = document.getElementById('last_name');
    const submitbtn = document.getElementById('submit');
    const password = document.getElementById('password');
    const confirmpassword = document.getElementById('confirm_password');
    const phone_number = document.getElementById('mobile');
    const email = document.getElementById('email');
    const image = document.getElementById('profile_picture');
    submitbtn.addEventListener('click', function (e) {
        e.preventDefault();
        // Check if all fields are empty
        if (first_name.value.length === 0 || last_name.value.length === 0 || password.value.length === 0 || confirmpassword.value.length === 0 || phone_number.value.length === 0 || email.value.length === 0 || image.files.length === 0) {
            alert('Please fill out all fields');
        }
        else {
            if (!valid_name(first_name.value, last_name.value)) {
                setError(first_name, 'Invalid name');
                setError(last_name, 'Invalid name');
                return;
            }
            if (!isValidPassword(password.value)) {
                setError(password, 'Invalid password');
                return;
            }
            if (password.value !== confirmpassword.value) {
                setError(confirmpassword, 'Passwords do not match');
                setError(password, 'Passwords do not match');
                return;
            }
            if (!isValidMobileNumber(phone_number.value)) {
                setError(phone_number, 'Invalid phone number');
                return;
            }
            if (!isValidEmail(email.value)) {
                setError(email, 'Invalid email');
                return;
            }
            // fetch request
            fetch('/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    first_name: first_name.value,
                    last_name: last_name.value,
                    email: email.value,
                    password: password.value,
                    confirm_password: confirmpassword.value,
                    phone_number: phone_number.value,
                    profile_picture: image.files[0] || null
                })
            }).then(response => {
                return response.json();
            }).then(data => {
                console.log(data);
            }).catch(err => {
                console.log(err);
            });
        }
    });
});
