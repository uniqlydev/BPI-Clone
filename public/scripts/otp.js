
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
    const submitbtn = document.getElementById('submit');

    submitbtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const inp_user = otpValue.join("");
        fetch('/mfa/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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
            window.location.href = '/deposit';
        }).catch(error => {
            console.log(error);
        });
    });
});





