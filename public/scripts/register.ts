const setError = (element: { parentElement: any; }, message: String) => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');

    errorDisplay.innerText = message;
    inputControl.classList.add('error');
    inputControl.classList.remove('success');
};


const valid_name = (first_name: string, last_name: string) => {

    const regex_checker = /^[A-Za-zÑñ ]{1,30}$/;


    if (first_name !== null && last_name !== null) {
        if (first_name.length !> 0 && last_name.length !> 0) {
            return false;
        } 

        // Check if valid
        if (regex_checker.test(first_name) && regex_checker.test(last_name)) {
            return true;
        }else {
            return false;
        }

    }else {
        return false;
    }
};


document.addEventListener('DOMContentLoaded', function () {
    // Check firstname and lastname
    const first_name = document.getElementById('first_name') as HTMLInputElement;
    const last_name = document.getElementById('last_name') as HTMLInputElement;

    if (valid_name(first_name.value, last_name.value)) {
        setError(first_name, 'Invalid name');
        setError(last_name, 'Invalid name');
    }

    
});