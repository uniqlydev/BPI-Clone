import bcrypt from "bcrypt";


class HashUtility {
    private salt: number;

    constructor(salt: number = 10) {
        this.salt = salt;
    }

    public async hashPassword(password: string): Promise<string> {
        try {
            const hash = await bcrypt.hash(password, this.salt);
            return hash;
        }catch (err) {
            console.error('Error hashing password:', err);
            throw new Error('Failed to hash password');
        }
    }

    
}

module.exports = HashUtility;