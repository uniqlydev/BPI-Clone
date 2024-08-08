import path from 'path'
import fs from 'fs';
import pool from '../model/database';
import Hash from '../utils/HashUtility';
import Validator from '../utils/Validator';
import {validationResult} from 'express-validator';
import RegisterRequest from '../interfaces/RegisterRequest';
import LoginRequest from '../interfaces/LoginRequest';
import { Request, Response } from 'express';
import Deposit from '../model/deposit';
import moment from 'moment';
import logger from '../utils/Logger';
import InputCleaner from '../utils/InputCleaner';





// Load dotenv
require('dotenv').config();
exports.register =  async (req: RegisterRequest , res: { status: (arg0: number) => { json(arg0: { message: string; }): unknown; (): any; new(): any; send: { (arg0: string): any; new(): any; };}; }) => {
    if (req.session?.user?.userType === 'Admin') {
        logger.error('POST /api/users/register:  Admin tried to register' + new Date().toISOString() + " Failed");
        return res.status(403).json({ message: 'Unauthorized' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send("Invalid input");
    }

    const hasher = new Hash();
    const { first_name, last_name, email, password, phone_number, confirm_password } = req.body;


    // Check if the password and confirm password match
    if (password !== confirm_password) {
        logger.error('POST /api/users/register:  Passwords do not match' + new Date().toISOString() + " Failed");
        return res.status(400).send('Passwords do not match.');
    }

    try {
        const cleaned_password = InputCleaner.cleanPassword(password) || '';
        const hashed_password = await hasher.hashPassword(cleaned_password);

                // Another layer of protection
        const cleaned = [
            InputCleaner.cleanName(first_name),
            InputCleaner.cleanName(last_name),
            InputCleaner.cleanEmail(email),
            hashed_password,
            InputCleaner.cleanPhone(phone_number),
        ];

        try {
            const client = await pool.connect();
            const query = `
              INSERT INTO public.users (first_name, last_name, email, password, phone_number)
              VALUES ($1, $2, $3, $4, $5)
            `;
            await client.query(query, cleaned);
            await client.release();

            // Put in session
            req.session.user = {
                email: email,
                authenticated: true,
                userType: 'user'
            };

            logger.info('POST /api/users/register:  User Reigstered Successfully: ' + new Date().toISOString());

            res.status(201).json({ message: 'User created successfully' });
          } catch (error) {
            logger.error('POST /api/users/register:  User Reigstration Failed: ' + new Date().toISOString());

            if (process.env.ENV === 'debug') {
                console.error("Error: ", error);
            }

            return res.status(500).json({ message: 'An error occurred' });
        }

    } catch(err){

        logger.error('POST /api/users/register:  User Reigstration Failed: ' + new Date().toISOString());

        if (process.env.ENV === 'debug') {
            console.error("Error: ", err);
        }

        return res.status(500).json({ message: 'An error occurred' });
    }
};


exports.login = (req: LoginRequest & Request, res: Response) => {

    if (req.session?.user?.userType === 'Admin') {
        logger.error('POST /api/users/register:  Admin tried to Login' + new Date().toISOString() + " Failed");
        return res.status(403).json({ message: 'Unauthorized' });
    }

    // Sanitize
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log('Nandito')
        logger.error('POST /api/users/login:  Login Attempt  ' + new Date().toISOString() + " Failed");
        return res.status(400).send("Invalid input");
    }

    if (Validator.isEmail(req.body.email) === false) {
        console.log('Nandito1')
        logger.error('POST /api/users/login:  Login Attempt  ' + new Date().toISOString() + " Failed");
        return res.status(400).send("Invalid email address");
    }

    // Retrieve the user with the email and password
    const userQuery = "SELECT id, password FROM public.users WHERE email = $1 AND role = 'user' LIMIT 1;";
    const values = [InputCleaner.cleanEmail(req.body.email)];

    if (values[0] === '') {
        logger.error('POST /api/users/login:  Login Attempt  ' + new Date().toISOString() + " Failed");
        return res.status(400).send('Invalid email address');
    }

    pool.query(userQuery, values, async (err: string, result: { rows: any[]; }) => {
        if (err) {
            if (process.env.ENV === 'debug') {
                console.error(err);
            }
            logger.error('POST /api/users/login:  Login Attempt  ' + new Date().toISOString() + " Failed");
            return res.status(400).send(err); // Send the error in the response
        }
        if (result && result.rows && result.rows.length > 0) {
            const user = result.rows[0];
            const hashedPassword = user.password;
            const hasher = new Hash();
            const cleanedPassword = InputCleaner.cleanPassword(req.body.password) || '';

            console.log(cleanedPassword);

            if (cleanedPassword === '') {
                logger.error('POST /api/users/login:  Login Attempt  ' + new Date().toISOString() + " Failed");
                return res.status(400).send('Invalid password');
            }


            const isMatch = await hasher.comparePassword(cleanedPassword, hashedPassword);
            if (isMatch) {

                // Audit logging
                logger.info('POST /api/users/login:  Login Attempt  ' + new Date().toISOString() + " Success");

                req.session.user = {
                    email: req.body.email,
                    authenticated: true,
                    userType: 'user'
                };

                return res.status(200).json({ message: 'Logged in successfully' });

            } else {

                // Audit logging
                logger.info('POST /api/users/login:  Login Attempt  ' + new Date().toISOString() + " Failed");

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
            logger.info('POST /api/users/login:  Login Attempt  ' + new Date().toISOString() + " Failed");
            return res.status(400).json({ message: 'Invalid email or password' });
        }
    });

};

exports.uploadImage = async (req: Request & { file: { buffer: Buffer } }, res: Response) => {
    // Check if user is authenticated
    if (!req.session?.user?.authenticated || req.session?.user?.userType === 'Admin') {
        logger.error('POST /api/users/deposit:  Unauthorized access attempt');
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

            logger.info('POST /api/users/uploadImage:  Image uploaded  ' + new Date().toISOString() + " Success");

            // Respond with JSON containing the file path or other metadata
            return res.status(200).json({
                message: 'File uploaded successfully',
                filePath: path.join('/images', filename),
            });
        });

    } catch (error) {

        logger.error('POST /api/users/uploadImage:  Image uploaded  ' + new Date().toISOString() + " Failed");

        if (process.env.ENV === 'debug') {
            console.error("Error: ", error);
        }

        console.error('Error updating profile picture');
        return res.status(500).json({ message: 'An error occurred' });
    }

};



exports.deposit = async (req: Request, res: Response) => {

    if (!req.session?.user?.authenticated || req.session?.user?.userType === 'Admin') {
        logger.error('POST /api/users/deposit:  Unauthorized access attempt');
        return res.status(401).json({ message: "Unauthorized" });
    }


    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('status/status_400', {
            message: "Invalid input"
        });
    }


    // CHange account Num to session
    const {date, amount ,checkNum} = req.body;

    // yyyy-mm-dd
    const formatted_date = moment(date, 'YYYY-MM-DD');

    // convert checnum to int
    const clean_checkNum = InputCleaner.cleanChequeNumber(checkNum);

    // Convert amount to double
    const clean_amount = InputCleaner.cleanMoney(amount);


    // Create new deposit class
    const email = req.session.user?.email || ""; // Use an empty string as the default value if email is undefined
    const ds = new Deposit(email, formatted_date.toDate() ,clean_checkNum || 0);

    if (clean_amount === 0) {
        logger.error('POST /api/users/deposit:  Deposit:\n Amount: ' + clean_amount + '\n Date: ' + formatted_date.toDate() + '\n Check Number: ' + clean_checkNum + '\n Account Number: ' + email + '\n' + new Date().toISOString() + " Failed");
        return res.status(400).json({ message: 'Invalid amount' });
    }

    const client = await pool.connect();

    const query = 'CALL createDeposit($1,$2,$3,$4)';
    const values = [ds.getEmail(), ds.getCheckNumber(), clean_amount,ds.getDate()];

    try {
        await client.query(query, values);
        await client.release();

        logger.info('POST /api/users/deposit:  Deposit:\n Amount: ' + clean_amount + '\n Date: ' + formatted_date.toDate() + '\n Check Number: ' + clean_checkNum + '\n Account Number: ' + email + '\n' + new Date().toISOString() + " Success");
        res.status(201).json({ message: 'Deposit created successfully' });
    } catch (error) {

        if (process.env.ENV === 'debug') {
            console.error('Error executing query:', error);
        }

        logger.error('POST /api/users/deposit:  Deposit:\n Amount: ' + clean_amount + '\n Date: ' + formatted_date.toDate() + '\n Check Number: ' + clean_checkNum + '\n Account Number: ' + email + '\n' + new Date().toISOString() + " Failed");
        res.status(500).json({ message: 'An error occurred' });
    }
};

exports.withdraw = async (req: Request, res: Response) => {

    if (!req.session?.user?.authenticated || req.session?.user?.userType === 'Admin') {
        logger.error('POST /api/users/deposit:  Unauthorized access attempt');
        return res.status(401).json({ message: "Unauthorized" });
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render('status/status_400', {
            message: "Invalid input"
        });
    }

    const email = req.session.user?.email || ""; // Use an empty string as the default value if email is undefined
    const {amount} = req.body;

    const converted_amount = InputCleaner.cleanMoney(amount);

    const client = await pool.connect();
    const query = 'CALL createWithdraw($1,$2)';

    const values = [email,converted_amount];

    try {
        await client.query(query, values);
        await client.release();
        logger.info('POST /api/users/withdraw:  Withdraw:\n Amount: ' + converted_amount + '\n Account Number: ' + email + '\n' + new Date().toISOString() + " Success");

        res.status(201).json({ message: 'Withdraw created successfully' });
    } catch (error) {

        if (process.env.ENV === 'debug') {
            console.error('Error executing query:', error);
        }

        logger.info('POST /api/users/withdraw:  Withdraw:\n Amount: ' + converted_amount + '\n Account Number: ' + email + '\n' + new Date().toISOString() + " Failed");
        res.status(500).json({ message: 'An error occurred' });
    }
}


exports.updateProfile = async (req: Request, res: Response) => {

    if (!req.session?.user?.authenticated || req.session?.user?.userType === 'Admin') {
        logger.error('POST /api/users/deposit:  Unauthorized access attempt');
        return res.status(401).json({ message: "Unauthorized" });
    }
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render('status/status_400', {
            message: "Invalid input"
        });
    }

    const { firstName, lastName, phoneNumber } = req.body;

    const query = 'UPDATE public.users SET first_name = $1, last_name = $2, phone_number = $3 WHERE email = $4';
    const values = [InputCleaner.cleanName(firstName), InputCleaner.cleanName(lastName), InputCleaner.cleanChequeNumber(phoneNumber), InputCleaner.cleanEmail(req.session.user.email)];

    try {
        await pool.query(query, values);
        logger.info('POST /api/users/updateProfile:  Profile Update:\n First Name: ' + firstName + '\n Last Name: ' + lastName + '\n Phone Number: ' + phoneNumber + '\n' + new Date().toISOString() + " Success");
        return res.render('status/status_200.ejs')
    } catch (error) {

        if (process.env.ENV === 'debug') {
            console.error("Error: ", error);
        }

        console.error('Error executing query');
        logger.error('POST /api/users/updateProfile:  Profile Update:\n First Name: ' + firstName + '\n Last Name: ' + lastName + '\n Phone Number: ' + phoneNumber + '\n' + new Date().toISOString() + " Failed");
        return res.render('status/status_500.ejs', {
            message: "Massive problem, LIKE HUGE"
        })
    }
};
