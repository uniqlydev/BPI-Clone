"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../model/User"));
const pool = require('../model/database');
const IDGenerator = require('../utils/IDGenerator');
const Hash = require('../utils/HashUtility');
exports.register = (req, res) => {
    const hasher = new Hash();
    const idGen = new IDGenerator();
    const { first_name, last_name, email, password, phone_number } = req.body;
    const hashed_password = hasher.hashPassword(password);
    req.body.password = null; // Setting to null
    console.log(hashed_password);
    const id = idGen.generateID();
    const query = "INSERT INTO Users(id, first_name, last_name, email, password, phone_number) VALUES($1, $2, $3, $4, $5, $6) RETURNING *";
    const user = new User_1.default(id, first_name, last_name, email, hashed_password, phone_number);
    pool.query(query, [user.getID(), user.getFirstName(), user.getLastName(), user.getEmail(), user.getPassword(), user.getPhone()], (err, result) => {
        if (err) {
            console.error('Error executing query', err); // Log the error for debugging
            return res.status(400).send(err); // Send the error in the response
        }
        if (result && result.rows && result.rows.length > 0) {
            return res.status(201).send(`User added with ID: ${result.rows[0].id}`);
        }
        else {
            console.error('No rows returned'); // Log the issue for debugging
            return res.status(400).send('User could not be added.');
        }
    });
};
exports.getUser = (req, res) => {
    // Retrieve all users
    const query = "SELECT email FROM Users;";
    pool.query(query, (err, result) => {
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
