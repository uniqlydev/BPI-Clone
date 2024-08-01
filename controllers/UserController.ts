import path from 'path'
import fs from 'fs';
import pool from '../model/database';
import IDGenerator from '../utils/IDGenerator';
import Hash from '../utils/HashUtility';
import Validator from '../utils/Validator';
import {validationResult} from 'express-validator';
import RegisterRequest from '../interfaces/RegisterRequest';
import LoginRequest from '../interfaces/LoginRequest';
import { Request, Response } from 'express';
import Deposit from '../model/deposit';
import moment from 'moment';



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
              INSERT INTO public.users (id, first_name, last_name, email, password, phone_number)
              VALUES ($1, $2, $3, $4, $5, $6)
            `;
            const values = [id, first_name, last_name, email, hashed_password, phone_number];
            await client.query(query, values);
            await client.release();

            // Put in session
            req.session.user = {
                email: email,
                authenticated: true,
                id: id.toString(),
            };

            res.status(201).json({ message: 'User created successfully' });
          } catch (error) {
            console.error('Error executing query:', error);

            if (process.env.ENV === 'debug') {
                res.status(500).json({
                    message: 'An error occurred:' + error,
                })
            }else {
                res.status(500).json({ message: 'An error occurred' });
            }
        }
    }catch(err){
        console.error('Error executing query', err); // Log the error for debugging

        if (process.env.ENV === 'debug') {
            res.status(500).json({
                message: 'An error occured: ' + err
            })
        }

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
    const userQuery = "SELECT id, password FROM public.users WHERE email = $1 AND role = 'user' LIMIT 1;";
    const values = [req.body.email];

    pool.query(userQuery, values, async (err: string, result: { rows: any[]; }) => {
        if (err) {
            console.error('Error executing query', err); // Log the error for debugging
            return res.status(400).send(err); // Send the error in the response
        }
        if (result && result.rows && result.rows.length > 0) {
            const user = result.rows[0];
            const hashedPassword = user.password;
            const hasher = new Hash();
            const isMatch = await hasher.comparePassword(req.body.password, hashedPassword);
            if (isMatch) {
                // Audit logging
                const auditQuery = "INSERT INTO audit_activity VALUES ($1, 'SUCCESS', 'User logged in', NOW());";
                const auditValues = [user.id];
                
                pool.query(auditQuery, auditValues, (auditErr: string) => {
                    if (auditErr) {
                        console.error('Error logging audit activity', auditErr);
                        // Log error but continue with login success
                    }
                    // Refresh the session
                    req.session.user = {
                        email: req.body.email,
                        authenticated: true,
                        id: user.id,
                    };
                    return res.status(200).json({ message: 'Login successful' });
                });
            } else {
                if (process.env.ENV === 'debug') { 
                    return res.status(500).json({
                        message: 'An error has occured at: ' + err
                    })
                }else {
                    return res.status(500).json({
                        message: 'An error has occured'
                    })
                }
            }
        } else {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
    });

};

exports.uploadImage = async (req: Request & { file: { buffer: Buffer } }, res: Response) => {
    // Check if user is authenticated
    if (!req.session?.user?.authenticated) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file?.buffer) {
        return res.status(400).json({ message: "No file uploaded" });
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
    const query = 'UPDATE public.users SET profile_picture = $1 WHERE email = $2';
    const values = [buffer, req.session.user.email];

    try {
        // Execute the query
        const result = await pool.query(query, values);
        console.log('Profile picture updated successfully:', result.rowCount);

        console.log(req.file ? req.file : 'No file uploaded');

        // Save the file to /images
        const destination = path.join(__dirname, '../images'); // Specify your destination directory
        const filename = `${Date.now()}-${req.file.originalname}`;

        fs.writeFile(path.join(destination, filename), req.file.buffer, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error saving image.');
            }

            console.log('File saved successfully:', filename);

            // Respond with JSON containing the file path or other metadata
            return res.status(200).json({
                message: 'File uploaded successfully',
                filePath: path.join('/images', filename),
            });
        });

    } catch (error) {
        console.error('Error updating profile picture:', error);
        return res.status(500).json({ message: 'An error occurred' });
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


exports.deposit = async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('status/status_400', {
            message: "Invalid input"
        });
    }


    // CHange account Num to session 
    const {accountNum, date, amount ,checkNum} = req.body;

    // yyyy-mm-dd
    const formatted_date = moment(date, 'YYYY-MM-DD');

    // convert checnum to int
    const clean_checkNum = parseInt(checkNum);

    // Convert amount to double
    const clean_amount = parseFloat(amount);


    // Create new deposit class 
    const ds = new Deposit(accountNum, formatted_date.toDate() ,clean_checkNum); 

    const client = await pool.connect(); 

    const query = 'CALL createDeposit($1,$2,$3,$4)';
    const values = [ds.getAccountNumber(), ds.getCheckNumber(), clean_amount,ds.getDate()];

    try {
        await client.query(query, values);
        await client.release();
        res.status(201).json({ message: 'Deposit created successfully' });
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ message: 'An error occurred' });
    }
};

exports.withdraw = async (req: Request, res: Response) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render('status/status_400', {
            message: "Invalid input"
        });
    }


    // Acount num needs to be in the session 
    const {accountNum, amount} = req.body;

    const converted_amount = parseFloat(amount);

    const client = await pool.connect();
    const query = 'CALL createWithdraw($1,$2)';

    const values = [accountNum, converted_amount];

    try {
        await client.query(query, values);
        await client.release();
        res.status(201).json({ message: 'Withdraw created successfully' });
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ message: 'An error occurred' });
    }
}

exports.transfer = async (req: Request, res: Response) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render('status/status_400', {
            message: "Invalid input"
        });
    }

    const {accountNum, receiver, amount} = req.body;

    const converted_amount = parseInt(amount);

    const client = await pool.connect();
    const query = 'CALL createTransfer($1,$2,$3)';

    const values = [accountNum, receiver, converted_amount];

    try {
        await client.query(query, values);
        await client.release();
        res.status(201).json({ message: 'Transfer created successfully' });
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ message: 'An error occurred' });
    }

}



exports.updateProfile = async (req: Request, res: Response) => {

    if (!req.session?.user?.authenticated) {
        return res.render('status/status_403', {
            message: "Unforbidden access."
        });
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render('status/status_400', {
            message: "Invalid input"
        });
    }

    const { firstName, lastName, phoneNumber } = req.body;

    const query = 'UPDATE public.users SET first_name = $1, last_name = $2, phone_number = $3 WHERE email = $4';
    const values = [firstName, lastName, phoneNumber, req.session.user.email];

    try {
        await pool.query(query, values);
        return res.render('status/status_200.ejs')
    } catch (error) {
        return res.render('status/status_500.ejs', {
            message: "Massive problem, LIKE HUGE"
        })
    }
};

