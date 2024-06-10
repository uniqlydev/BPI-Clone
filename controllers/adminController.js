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
    const hash = new HashUtility_1.default();
    // Clean up the input
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
            if (await hash.comparePassword(req.body.password, result.rows[0].password) === true) {
                req.session.user = result.rows[0];
                return res.status(200).send('Login successful');
            }
            else {
                return res.status(400).send('Invalid credentials');
            }
        }
        else {
            console.error('No rows returned');
            return res.status(400).send('User not found');
        }
    });
};
