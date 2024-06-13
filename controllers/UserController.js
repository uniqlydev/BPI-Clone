"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../model/database"));
const IDGenerator_1 = __importDefault(require("../utils/IDGenerator"));
const HashUtility_1 = __importDefault(require("../utils/HashUtility"));
const Validator_1 = __importDefault(require("../utils/Validator"));
const express_validator_1 = require("express-validator");
exports.register = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).send("Invalid input");
    }
    const hasher = new HashUtility_1.default();
    const idGen = new IDGenerator_1.default();
    const { first_name, last_name, email, password, phone_number, confirm_password } = req.body;
    // Check if the password and confirm password match
    if (password !== confirm_password) {
        return res.status(400).send('Passwords do not match.');
    }
    try {
        const hashed_password = await hasher.hashPassword(password);
        const id = idGen.generateID();
        try {
            const client = await database_1.default.connect();
            const query = `
              INSERT INTO users (id, first_name, last_name, email, password, phone_number, profile_picture)
              VALUES ($1, $2, $3, $4, $5, $6)
            `;
            const values = [id, first_name, last_name, email, hashed_password, phone_number];
            await client.query(query, values);
            await client.release();
            res.status(200).send('User registered successfully.');
        }
        catch (error) {
            console.error('Error executing query:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    catch (err) {
        console.error('Error executing query', err); // Log the error for debugging
        return res.status;
    }
};
exports.getUser = (req, res) => {
    // Retrieve all users
    const query = "SELECT email FROM Users;";
    database_1.default.query(query, (err, result) => {
        if (err) {
            console.error('Error executing query', err); // Log the error for debugging
            return res.status(400).send(err); // Send the error in the response
        }
        if (result && result.rows && result.rows.length > 0) {
            return res.status(200).send(result.rows);
        }
        else {
            console.error('No rows returned'); // Log the issue for debugging
            return res.status(400).send('No users found.');
        }
    });
};
exports.login = (req, res) => {
    // Sanitize
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).send("Invalid input");
    }
    if (Validator_1.default.isEmail(req.body.email) === false)
        return res.status(400).send("Invalid email address");
    const query = "SELECT * FROM Users WHERE email = $1";
    database_1.default.query(query, [req.body.email], async (err, result) => {
        if (err) {
            console.error('Error executing query', err); // Log the error for debugging
            return res.status(400).send(err); // Send the error in the response
        }
        if (result && result.rows && result.rows.length > 0) {
            const user = result.rows[0];
            const hasher = new HashUtility_1.default();
            const isValid = await hasher.comparePassword(req.body.password, user.password);
            if (isValid) {
                return res.status(200).send('Login successful');
            }
            else {
                return res.status(400).send('Invalid credentials');
            }
        }
        else {
            console.error('No rows returned'); // Log the issue for debugging
            return res.status(400).send('User not found.');
        }
    });
};
exports.uploadImage = (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    return res.status(200).send('File uploaded successfully.');
};
