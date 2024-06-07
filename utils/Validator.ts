import validator from 'validator';

class Validator {

    public static isEmail(email: string): boolean {
        // Trim first
        email = validator.ltrim(email);
        email = validator.rtrim(email);
        validator.normalizeEmail(email)

        return validator.isEmail(email);
    }

    public static isPhone(phone: string): boolean {
        return validator.isMobilePhone(phone);
    };

    public static isStrongPassword(password: string): boolean {
        return validator.isStrongPassword(password);
    };
}

export default Validator;