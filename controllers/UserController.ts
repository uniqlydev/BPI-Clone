import User from '../model/User';
import pool from '../model/database';
import IDGenerator from '../utils/IDGenerator';
import Hash from '../utils/HashUtility';
import Validator from '../utils/Validator';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import RegisterRequest from '../interfaces/RegisterRequest';
import LoginRequest from '../interfaces/LoginRequest';
import { Request, Response } from 'express';



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

            // Put in session
            req.session.user = {
                email: email,
                authenticated: true
            };

            res.status(201).json({ message: 'User created successfully' });
          } catch (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ message: 'An error occurred' });
        }
    }catch(err){
        console.error('Error executing query', err); // Log the error for debugging
        return res.status
    }
};


exports.login = (req: LoginRequest & Request, res: Response) => {

    // Sanitize
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).send("Invalid input");
    }

    if (Validator.isEmail(req.body.email) === false) 
        return res.status(400).send("Invalid email address");

    // Retrieve the user with the email and password 
    const user = "SELECT password FROM Users WHERE email = $1 LIMIT 1;"
    const values = [req.body.email];

    pool.query(user, values, async (err: string, result: { rows: any; }) => {
        if (err) {
            console.error('Error executing query', err); // Log the error for debugging
            return res.status(400).send(err); // Send the error in the response
        }
        if (result && result.rows && result.rows.length > 0) {
            const hashedPassword = result.rows[0].password;
            const hasher = new Hash();
            const isMatch = await hasher.comparePassword(req.body.password, hashedPassword);
            if (isMatch) {
                req.session.user = {
                    email: req.body.email,
                    authenticated: true
                };
                return res.status(200).json({ message: 'Login successful' });

            } else {
                return res.status(400).json({ message: 'Invalid email or password' });
            }
        } else {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
    });




};

exports.uploadImage = (req: Request & { file: { path: string } }, res: Response) => {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
  
    const filePath = req.file.path;
    const query = "UPDATE Users SET profile_image = $1 WHERE email = $2;";
  
    if (req.session && req.session.user) {
      const values = [filePath, req.session.user.email];
      pool.query(query, values, (err: string) => {
        if (err) {
          console.error('Error executing query', err); // Log the error for debugging
          return res.status(400).send(err); // Send the error in the response
        }
  
        res.status(200).json({ message: 'File uploaded and user profile updated successfully' });
      });
    } else {
      res.status(400).json({ message: 'User not authenticated' });
    }
  };
  

