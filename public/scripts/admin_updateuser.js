document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.submit-btn');

    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            const status = document.getElementById(`status_${userId}`).value;
            const newStatus = status === 'active';

            const newBody = {
                userid: userId,
                status: newStatus
            };

            fetch('/api/admin/updateuser', {  // Updated endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newBody),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("There was an error updating the status");
                }
                return response.json();
            })
            .then(data => {
                alert('User status changed');
                window.location.href = '/acctadmin/dashboard';
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    });
});
