"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const Validator_1 = __importDefault(require("../utils/Validator"));
const database_1 = __importDefault(require("../model/database"));
const HashUtility_1 = __importDefault(require("../utils/HashUtility"));
exports.login = (req, res) => {
    // Sanitize
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).send("Invalid input");
    }
    if (Validator_1.default.isEmail(req.body.email) === false)
        return res.status(400).send("Invalid email address");
    const query = "SELECT * FROM Users WHERE email = $1 AND role = 'superuser'";
    database_1.default.query(query, [req.body.email], async (err, result) => {
        if (err) {
            console.error('Error executing query', err);
            return res.status(400).send(err);
        }
        if (result && result.rows && result.rows.length > 0) {
            const user = result.rows[0];
            const hasher = new HashUtility_1.default();
            const isValid = await hasher.comparePassword(req.body.password, user.password);
            if (isValid) {
                req.session.admin_authenticated = true;
                req.session.admin = user;
                req.session.save((err) => {
                    if (err) {
                        return res.status(500).send('Internal Server Error');
                    }
                    res.status(201).json({ message: 'Login successful' });
                });
            }
            else {
                return res.status(400).send('Invalid credentials');
            }
        }
        else {
            // User is not an admin account
            return res.status(400).send('User not found.');
        }
    });
};
