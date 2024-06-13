
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
    const username = document.getElementById('inp_user');
    const password = document.getElementById('inp_pass');

    const valid_username = username.value.trim();
    const valid_password = password.value.trim();


    let isValid = true;


    // Last Name Validation
    if (valid_username === '') {
        setError(username, 'Please provide a valid username');
        isValid = false;
    } else if (!isValidUsername(valid_username)){
        setError(username, "Please provide a valid username");
        isValid = false;
    } else {
        setSuccess(username);
    }

    // Password Validation
    if (valid_password === '') {
        setError(password, 'Password cannot be blank');
        isValid = false;
    }

    return isValid;
};


const isValidUsername = username => {
    const re = /^[a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/;
    return re.test(String(username));
}

const isValidPassword = password => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*_])[A-Za-z\d@$!%*_]{12,16}$/;
    return re.test(String(password));
};


document.addEventListener('DOMContentLoaded', () => {
    const submitbtn = document.getElementById('submit');
    const inp_user = document.getElementById('inp_user');
    const inp_pass = document.getElementById('inp_pass');

    submitbtn.addEventListener('click', async (e) => {
        e.preventDefault();

        if (validateInputs() == true) {

            fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: inp_user.value,
                    password: inp_pass.value,
                })
            }).then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Invalid username or password');
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

// Function to escape special characters to prevent XSS
const escapeHtml = (unsafe) => {
    return unsafe.replace(/[&<"']/g, (m) => {
        switch (m) {
            case '&':
                return '&amp;';
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case '"':
                return '&quot;';
            case "'":
                return '&#039;';
        }
    });
};

