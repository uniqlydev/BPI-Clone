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



const validateInputs = async () => {
    const first_name = document.getElementById('first_name');
    const last_name = document.getElementById('last_name');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmpassword');
    const mobile = document.getElementById('mobile');
    const email = document.getElementById('email');
    const profile_picture = document.getElementById('profile_picture');
    
    const valid_first_name = first_name.value.trim();
    const valid_last_name = last_name.value.trim();
    const valid_password = password.value.trim();
    const valid_confirmPassword = confirmPassword.value.trim();
    const valid_mobile_number = mobile.value.trim();
    const valid_email = email.value.trim();
    const valid_profile_picture = profile_picture.files[0];

    let isValid = true;

    // First Name Validation
    if (valid_first_name === '') {
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
    } else if (!isValidPassword(valid_password)) {
        setError(password, "Password should contain at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special character, and must be 12-16 characters long");
        isValid = false;
    } else {
        setSuccess(password);
    }

    // Confirm Password Validation
    if (valid_confirmPassword === '') {
        setError(confirmPassword, 'Passwords do not match');
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
    } else if (!isValidEmail(valid_email)) {
        setError(email, 'Provide a valid email');
        isValid = false;
    } else {
        setSuccess(email);
    }

    // Profile Picture Validation
    if (!valid_profile_picture) {
        setError(profile_picture, 'Profile picture cannot be blank');
        isValid = false;
    } else if (!(await isValidProfilePicture(valid_profile_picture))) {
        setError(profile_picture, 'Provide a valid PNG or JPEG image');
        isValid = false;
    } else {
        setSuccess(profile_picture);
    }

    return isValid;
};

const isValidFirstName = first_name => {
    const re = /^[A-Za-zÑñ ]{1,30}$/;
    return re.test(String(first_name));
};

const isValidLastName = last_name => {
    const re = /^[A-Za-zÑñ ]{1,30}$/;
    return re.test(String(last_name));
};

const isValidPassword = password => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*_])[A-Za-z\d@$!%*_]{12,16}$/;
    return re.test(String(password));
};

const isValidMobileNumber = mobile => {
    const re = /^(\+639\d{9}|09\d{9})$/;
    return re.test(String(mobile));
};

const isValidEmail = email => {
    const re = /^[a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/;
    return re.test(String(email));
};

const isValidProfilePicture = file => {
    const validTypes = ['image/jpeg', 'image/png'];
    const validType = validTypes.includes(file.type);

    if (!validType) {
        return false;
    }

    // Check the file header (magic numbers)
    const fileHeaderValid = new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = function(e) {
            const arr = (new Uint8Array(e.target.result)).subarray(0, 4);
            let header = "";
            for (let i = 0; i < arr.length; i++) {
                header += arr[i].toString(16);
            }

            let isValid = false;
            switch (header) {
                case "89504e47": // PNG
                    isValid = true;
                    break;
                case "ffd8ffe0":
                case "ffd8ffe1":
                case "ffd8ffe2": // JPEG
                    isValid = true;
                    break;
                default:
                    isValid = false; // other file types
                    break;
            }

            resolve(isValid);
        };

        reader.onerror = function() {
            reject(false);
        };

        reader.readAsArrayBuffer(file);
    });

    return fileHeaderValid;
};

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const submitbtn = document.getElementById('submit');

    submitbtn.addEventListener('click', async (e) => {
        e.preventDefault();

        if (await validateInputs()) {
            const formData = new FormData(registerForm);

            fetch('/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    first_name: registerForm.first_name.value,
                    last_name: registerForm.last_name.value,
                    password: registerForm.password.value, 
                    email: registerForm.email.value,
                    phone_number: registerForm.mobile.value,
                    confirm_password: registerForm.confirmpassword.value
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
        } else {
            alert('Invalid Input');
        }
    });
});
