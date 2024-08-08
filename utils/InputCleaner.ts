class InputCleaner {
    // req.body cleaner
    static cleanUsername(username: string) {
        const re = /^[a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/;

        if (re.test(username)) {
            return username;
        } else {
            return null;
        }
    }

    static cleanPassword(password: string) {
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*_])[A-Za-z\d@$!%*_]{8,16}$/;

        if (re.test(password)) {
            return password;
        } else {
            return null;
        }
    }

    static cleanName(name: string) {
        const re = /^[A-Za-zÑñ ]{1,30}$/;

        if (re.test(name)) {
            return name;
        } else {
            return null;
        }
    }

    static cleanPhone(phone: string) {
        const re = /^(\+639\d{9}|09\d{9})$/;

        if (re.test(phone)) {
            return phone;
        } else {
            return null;
        }
    }

    static cleanEmail(email: string) {
        const re = /^[a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/;

        if (re.test(email)) {
            return email;
        } else {
            return null;
        }
    }


    static cleanMoney(money: Number) {
        const re = /^[0-9]+(\.[0-9]{1,2})?$/;

        if (re.test(money.toString())) {
            return parseFloat(money.toString()); // Ensuring the money is returned as a number
        } else {
            return null;
        }
    }

    static cleanChequeNumber(chequeNumber: Number) {
        const re = /^[0-9]+$/;

        if (re.test(chequeNumber.toString())) {
            return parseInt(chequeNumber.toString()); // Ensuring the cheque number is returned as a number
        } else {
            return null;
        }
    }

    static cleanStatus(status: string) {
        const re = /^(true|false)$/;

        if (re.test(status)) {
            return status;
        } else {
            return null;
        }
    }

}

export default InputCleaner;
