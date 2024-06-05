import * as crypto from 'crypto';

class RandomString {
    
    public async generateRandomString(): Promise<String> {
        try {
            const random = await crypto.randomBytes(32);
            return random.toString();
        }catch(e) {
            console.error('Error hashing password:', e);
            throw new Error('Failed to hash password');
        }
    }
}

export default RandomString;