const isValidProfilePicture = file => {
    const validTypes = ['image/jpeg', 'image/png'];
    const validType = validTypes.includes(file.type);

    if (!validType) {
        return false;
    }

    // Check the file header (magic numbers)
    const fileHeaderValid = new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = function(e) {
            const arr = (new Uint8Array(e.target.result)).subarray(0, 4);
            let header = "";
            for (let i = 0; i < arr.length; i++) {
                header += arr[i].toString(16);
            }

            let isValid = false;
            switch (header) {
                case "89504e47": // PNG
                    isValid = true;
                    break;
                case "ffd8ffe0":
                case "ffd8ffe1":
                case "ffd8ffe2": // JPEG
                    isValid = true;
                    break;
                default:
                    isValid = false; // other file types
                    break;
            }

            resolve(isValid);
        };

        reader.onerror = function() {
            reject(false);
        };

        reader.readAsArrayBuffer(file);
    });

    return fileHeaderValid;
};

document.addEventListener('DOMContentLoaded', () => {
    const profile_pic = document.getElementById('profile_pic');
    const submitbtn = document.getElementById('submit');

    submitbtn.addEventListener('click', async (event) => {
        event.preventDefault(); // Prevent the default form submission

        const file = profile_pic.files[0];

        if (!file) {
            console.error('No file selected.');
            return;
        }

        // Validate file type
        const isValidType = isValidProfilePicture(file);
        if (!isValidType) {
            console.error('Invalid file type. Please upload a JPEG or PNG image.');
            return;
        }

        // Check for malicious file (optional)
        const isMalicious = await checkForMaliciousFile(file);
        if (isMalicious) {
            console.error('File appears to be malicious.');
            return;
        }

        // If all validations pass, proceed with upload
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
            console.error('Error:', error);
        }
    });

    // Function to check for malicious files (example: checking file size or content)
    async function checkForMaliciousFile(file) {
        // Implement your own checks here, e.g., checking file size, content, etc.
        // For simplicity, let's assume a basic check by file size
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

        if (file.size > MAX_FILE_SIZE) {
            return true; // Consider file malicious if it exceeds size limit
        }

        return false; // File is not considered malicious based on basic check
    }
});
