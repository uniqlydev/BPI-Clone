"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class User {
    constructor(id, first_name, last_name, email, password, phone, profile_picture) {
        this.id = id;
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.role = "user";
    }
    getID() {
        return this.id;
    }
    getFirstName() {
        return this.first_name;
    }
    getLastName() {
        return this.last_name;
    }
    getEmail() {
        return this.email;
    }
    getPassword() {
        return this.password;
    }
    getPhone() {
        return this.phone;
    }
    getRole() {
        return this.role;
    }
}
exports.default = User;
