import bcrypt from "bcrypt";


class HashUtility {
    private salt: number;

    constructor(salt: number = 10) {
        this.salt = salt;
    }

    public async hashPassword(password: string): Promise<String> {
        try {
            const hash = await bcrypt.hash(password, this.salt);
            return hash;
        }catch (err) {
            console.error('Error hashing password:', err);
            throw new Error('Failed to hash password');
        }
    }

    public async comparePassword(password: string, hash: string): Promise<Boolean> {
        try {
            const isValid = await bcrypt.compare(password, hash);
            return isValid;
        }catch (err) {
            console.error('Error comparing password:', err);
            throw new Error('Failed to compare password');
        }
    }

    
}

export default HashUtility;