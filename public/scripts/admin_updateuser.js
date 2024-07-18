document.addEventListener('DOMContentLoaded', function() {
    const updateForms = document.querySelectorAll('.update-form');

    updateForms.forEach(form => {
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent the default form submission

            const formData = new FormData(form);
            const id = formData.get('id');
            const status = formData.get('status');

            const newbody = {
                status: status,
                id: id
            }

            console.log(JSON.stringify(newbody));

            fetch('/api/admin/updateuser', {
                method: 'PUT',
                body: {
                    status: status,
                    id: id
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("There was an error");
                }

                return response.json();
            })
            .then(data => {
                alert('User status changed')
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    });
});