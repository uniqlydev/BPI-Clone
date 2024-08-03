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
            if (response.ok) {
                alert('Cheque created');
                window.location.href = '/admin/dashboard';
            }
        }).catch(error => {
            console.error('Error:', error);
        });

    });
});
