import User from '../model/User';
import path from 'path'
import fs from 'fs';
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
    const user = "SELECT password FROM Users WHERE email = $1 AND role = 'user' LIMIT 1;"
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
                // Refresh the session
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

exports.uploadImage = async (req: Request & { file: { buffer: Buffer } }, res: Response) => {
    // Check if user is authenticated
    if (!req.session.user || !req.session.user.authenticated) {
        return res.status(401).json({message: "Unauthorized"});
    }

    if (!req.file || !req.file.buffer) {
        return res.status(400).json({message: "No file uploaded"});
    }

    const buffer = req.file.buffer;

    // Validate file type based on magic numbers
    const pngMagicNumbers = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    const jpgMagicNumbers = Buffer.from([0xFF, 0xD8, 0xFF]);
    const jpegMagicNumbers1 = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
    const jpegMagicNumbers2 = Buffer.from([0xFF, 0xD8, 0xFF, 0xE1]);

    let fileType = '';

    if (buffer.slice(0, pngMagicNumbers.length).equals(pngMagicNumbers)) {
        fileType = 'PNG';
    } else if (buffer.slice(0, jpgMagicNumbers.length).equals(jpgMagicNumbers)) {
        fileType = 'JPG';
    } else if (buffer.slice(0, jpegMagicNumbers1.length).equals(jpegMagicNumbers1) && buffer.slice(6, 10).toString() === 'JFIF') {
        fileType = 'JPEG';
    } else if (buffer.slice(0, jpegMagicNumbers2.length).equals(jpegMagicNumbers2) && buffer.slice(6, 10).toString() === 'Exif') {
        fileType = 'JPEG';
    } else {
        return res.status(400).send('Unsupported file type.');
    }

    // Prepare query to update user's profile picture
    const query = 'UPDATE Users SET profile_picture = $1 WHERE email = $2';
    const values = [buffer, req.session.user.email];

    try {
        // Execute the query
        const result = await pool.query(query, values);
        console.log('Profile picture updated successfully:', result.rowCount);

        console.log(req.file !== undefined ? req.file : 'No file uploaded');

        // Save the file to /images
        const destination = path.join(__dirname, '../images'); // Specify your destination directory
        const filename = Date.now() + '-' + req.file!.originalname;
    
        fs.writeFile(path.join(destination, filename), req.file!.buffer, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error saving image.');
            }
    
            console.log('File saved successfully:', filename);
    
            // Optionally, you can respond with JSON containing the file path or other metadata
            res.status(200).json({
                message: 'File uploaded successfully',
                filePath: path.join('/images', filename),
            });
        });

        res.status(200).json({ message: 'Profile picture updated successfully', fileType });
    } catch (error) {
        console.error('Error updating profile picture:', error);
        res.status(500).json({ message: 'An error occurred' });
    }
};

exports.logout = (req: Request, res: Response) => {
    req.session.destroy((err: any) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }
        res.status(200).send('Logged out successfully');
    });
}

