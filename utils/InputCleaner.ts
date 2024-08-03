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
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

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

    static cleanUpdateUser() {}





}
