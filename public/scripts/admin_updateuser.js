document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.submit-btn');

    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            const lastName = document.getElementById(`last_name_${userId}`).value;
            const firstName = document.getElementById(`first_name_${userId}`).value;
            const status = document.getElementById(`status_${userId}`).value;
            const newStatus = status === 'active';

            const newBody = {
                last_name: lastName,
                first_name: firstName,
                userid: userId,
                status: newStatus
            };

            fetch('/api/admin/updateuser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newBody),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("There was an error");
                }
                return response.json();
            })
            .then(data => {
                alert('User status changed');
                window.location.href = '/admin/dashboard';
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    });
});
