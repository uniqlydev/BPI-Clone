
const otpValue = [];

function moveNext(input, index) {
    const inputs = document.querySelectorAll(".otp-input");
    otpValue[index] = input.value;
    if (input.value && index < inputs.length - 1) {
        inputs[index + 1].focus();
    }
    console.log(otpValue.join(""));
}

    
document.addEventListener('DOMContentLoaded', () => {
    const adminSubmit = document.getElementById('submit');

    adminSubmit.addEventListener('click', async (e) => {
        e.preventDefault();

        const inp_user = otpValue.join(""); // otpValue should be defined elsewhere

        try {
            const response = await fetch('/mfa/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code: inp_user
                })
            }).then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Invalid username or password');
                }
            }).then(data => {
                console.log(data);
                const receivedData = sessionStorage.getItem('dataKey');
                console.log(receivedData); 
                // Redirect based on role
                if (receivedData == 'acctad') {
                    window.location.href = '/acctadmin/dashboard';
                } else if (receivedData == 'transacad') {
                    window.location.href = '/admin/dashboard';
                } else {
                    alert('Unknown role received.');
                }
            }).catch(error => {
                console.log(error);
            });
        } catch (error) {
            console.error('Error:', error);
            alert('Login failed. Please check your credentials and try again.');
        }
    });
});
