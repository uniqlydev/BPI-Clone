document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('submit').addEventListener('click', function() {
        const last_name = document.getElementById('last_name').value;
        const first_name = document.getElementById('first_name').value;
        const userid = document.getElementById('userid').value;
        const status = document.getElementById('status').value;
        const newStatus = status === 'active' ? true : false;

        const newbody = {
            last_name: last_name,
            first_name: first_name,
            userid: userid,
            status: newStatus
        }

        fetch('/api/admin/updateuser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Add this header
            },
            body: JSON.stringify(newbody),
        })

        .then(response => {
            if (!response.ok) {
                throw new Error("There was an error");
            }

            return response.json();
        })
        .then(data => {
            alert('User status changed')
            window.location.href = '/admin/dashboard';
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});
