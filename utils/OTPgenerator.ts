import crypto from 'crypto';

export function generateOTP(): string {
    const randomNum = crypto.randomInt(0, 10 ** 6);
    return randomNum.toString().padStart(6, '0');
}