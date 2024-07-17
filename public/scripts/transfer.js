document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('submit').addEventListener('click', function() {
        const accountNumber = document.getElementById('accountNum').value;
        const receiver = document.getElementById('receiver').value;
        const amount = document.getElementById('amount').value;



        const body = {
            accountNum: accountNumber,
            receiver: receiver,
            amount: amount
        };

        console.log(body)

        // Create post request
        fetch('/api/users/transfer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }).then(response => {
            if (response.status === 201) {
                alert('Transfer successful');
                window.location.href = '/transfer';
            } else {
                alert('Transfer failed');
            }
        }).catch(error => {
            console.error('Error:', error);
        });
    });
});