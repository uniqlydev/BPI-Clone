import User from '../model/User';
import pool from '../model/database';
import IDGenerator from '../utils/IDGenerator';
import Hash from '../utils/HashUtility';
import Validator from '../utils/Validator';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import RegisterRequest from '../interfaces/RegisterRequest';



exports.register =  async (req: RegisterRequest , res: { status: (arg0: number) => {
    json(arg0: { message: string; }): unknown; (): any; new(): any; send: { (arg0: string): any; new(): any; }; 
}; }) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send("Invalid input");
    }

    const hasher = new Hash();
    const idGen = new IDGenerator();
    const { first_name, last_name, email, password, phone_number, confirm_password } = req.body;

    // Check if the password and confirm password match
    if (password !== confirm_password) {
        return res.status(400).send('Passwords do not match.');
    }


    try {
        const hashed_password = await hasher.hashPassword(password);

        const id = idGen.generateID();


        try {
            const client = await pool.connect();
            const query = `
              INSERT INTO users (id, first_name, last_name, email, password, phone_number)
              VALUES ($1, $2, $3, $4, $5, $6)
            `;
            const values = [id, first_name, last_name, email, hashed_password, phone_number];
            await client.query(query, values);
            await client.release();
        
            res.status(200).json({ message: 'User registered successfully' });
          } catch (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ message: 'An error occurred' });
        }
    }catch(err){
        console.error('Error executing query', err); // Log the error for debugging
        return res.status
    }
};


exports.getUser = (req:any,res: any) => {
    // Retrieve all users
    const query = "SELECT email FROM Users;"

    pool.query(query, (err: string, result: { rows: any; }) => {
        if (err) {
            console.error('Error executing query', err); // Log the error for debugging
            return res.status(400).send(err); // Send the error in the response
        }
        if (result && result.rows && result.rows.length > 0) {
            return res.status(200).send(result.rows);
        } else {
            console.error('No rows returned'); // Log the issue for debugging
            return res.status(400).send('No users found.');
        }
    });
};


exports.login = (req: any, res: any) => {

    // Sanitize
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).send("Invalid input");
    }

    if (Validator.isEmail(req.body.email) === false) 
        return res.status(400).send("Invalid email address");

    const query = "SELECT * FROM Users WHERE email = $1";

    pool.query(query, [req.body.email], async (err: string, result: { rows: any; }) => {
        if (err) {
            console.error('Error executing query', err); // Log the error for debugging
            return res.status(400).send(err); // Send the error in the response
        }
        if (result && result.rows && result.rows.length > 0) {
            const user = result.rows[0];
            const hasher = new Hash();
            const isValid = await hasher.comparePassword(req.body.password, user.password);
            if (isValid) {
                return res.status(200).send('Login successful');
            } else {
                return res.status(400).send('Invalid credentials');
            }
        } else {
            console.error('No rows returned'); // Log the issue for debugging
            return res.status(400).send('User not found.');
        }
    });

};

// UserController.js

exports.uploadImage = (req: { file: { path: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; send: { (arg0: string): void; new(): any; }; }; }) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const filePath = req.file.path; 

    // Respond with a success message or further processing
    res.status(200).send('File uploaded successfully.');
};


