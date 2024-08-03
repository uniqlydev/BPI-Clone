document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('submit').addEventListener('click', function() {
        const date = document.getElementById('date').value;
        const checkNum = document.getElementById('checkNum').value;
        const amount = document.getElementById('amount').value;

        const body = {
            date: date,
            checkNum: checkNum,
            amount: amount
        };

        console.log(body)

        // Create post request
        fetch('/api/users/deposit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }).then(response => {
            if (response.status === 201) {
                alert('Deposit successful');
                window.location.href = '/deposit';
            } else {
                alert('Deposit failed');
            }
        }).catch(error => {
            console.error('Error:', error);
        });
    });
});
