"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uniqid = require('uniqid');
class IDGenerator {
    generateID() {
        return "user-" + uniqid();
    }
}
exports.default = IDGenerator;
