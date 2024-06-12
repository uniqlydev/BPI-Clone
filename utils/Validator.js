"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validator_1 = __importDefault(require("validator"));
class Validator {
    static isEmail(email) {
        // Trim first
        email = validator_1.default.ltrim(email);
        email = validator_1.default.rtrim(email);
        validator_1.default.normalizeEmail(email);
        return validator_1.default.isEmail(email);
    }
    static isPhone(phone) {
        return validator_1.default.isMobilePhone(phone);
    }
    ;
    static isStrongPassword(password) {
        return validator_1.default.isStrongPassword(password);
    }
    ;
}
exports.default = Validator;
