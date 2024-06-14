document.addEventListener('DOMContentLoaded', () => {
    const profile_pic = document.getElementById('profile_pic');
    const submit = document.getElementById('submit');

    // Check file extension
    const isValidFile = file => {
        const allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
        return allowedExtensions.test(file);
    };

    // Validate file
    const validateFile = file => {
        if (!isValidFile(file.name)) {
            alert('Invalid file type. Please upload a jpg, jpeg, or png file');
            return false;
        }
        return true;
    };

    submit.addEventListener('click', async () => {
        const file = profile_pic.files[0];
        if (!file) {
            alert('Please upload a file');
            return;
        }

        if (!validateFile(file)) {
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/api/users/img', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to upload file');
            }

            const data = await response.text();
            console.log(data); // Output the response from the server

        } catch (error) {
            alert("Failed to upload file. Please try again.")
            // Refresh
            location.reload();
        }
    })




});


