document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('submit').addEventListener('click', function() {

        const cheque = {
            chequeNum: document.getElementById('chequeNum').value,
            amount: document.getElementById('amount').value,
            date: document.getElementById('date').value
        }

        console.log(cheque);

        fetch('/api/admin/createcheque', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cheque)
        }).then(response => {
            if (response.status === 201) {
                alert('Cheque created successfully');
                window.location.href = '/admin/createcheque';
            } else {
                alert('Cheque creation failed');
            }
        }).catch(error => {
            console.error('Error:', error);
        });

        
    });
});