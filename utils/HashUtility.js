"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
class HashUtility {
    constructor(salt = 10) {
        this.salt = salt;
    }
    async hashPassword(password) {
        try {
            const hash = await bcrypt_1.default.hash(password, this.salt);
            return hash;
        }
        catch (err) {
            console.error('Error hashing password:', err);
            throw new Error('Failed to hash password');
        }
    }
    async comparePassword(password, hash) {
        try {
            const isValid = await bcrypt_1.default.compare(password, hash);
            return isValid;
        }
        catch (err) {
            console.error('Error comparing password:', err);
            throw new Error('Failed to compare password');
        }
    }
}
exports.default = HashUtility;
