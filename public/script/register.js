

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    const first_name = document.getElementById('first-name').value;
    const last_name = document.getElementById('last-name').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const mobile_number = document.getElementById('mobile-number').value;



    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        

        const validateInputs = () => {
            const valid_first_name = first_name.value.trim();
            const valid_last_name = last_name.value.trim();
            const valid_username = username.value.trim();
            const valid_password = password.value.trim();
            const valid_confirmPassword = confirmPassword.value.trim();
            const valid_mobile_number = mobile_number.value.trim();

        
        };

        const response = await fetch('/api/user/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, confirmPassword }),
        });

        const data = await response.json();

        if (response.ok) {
            statusMsg.textContent = "Registration successful";
            window.location.href = '/';
        } else {
            statusMsg.textContent = data.message;
        }
    });
});