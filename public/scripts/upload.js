document.getElementById('DOMContentLoaded', () => {
    const profile_pic = document.getElementById('profile_picture');
    const submit = document.getElementById('submit');

    // Check if they all exists
    if (profile_pic && submit) {
        console.log('All elements exist');
    }else {
        console.log('Some elements do not exist');
    }
});