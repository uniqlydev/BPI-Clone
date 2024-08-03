document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('submit').addEventListener('click', function() {
        const amount = document.getElementById('amount').value;

        const body = {
            amount: amount
        };

        // Create post request
        fetch('/api/users/withdraw', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }).then(response => {
            if (response.status === 201) {
                alert('Withdraw successful');
                window.location.href = '/withdraw';
            } else {
                alert('Withdraw failed');
            }
        }).catch(error => {
            console.error('Error:', error);
        });
    });
});
