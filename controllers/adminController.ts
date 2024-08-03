import { body, validationResult } from 'express-validator';
import Validator from '../utils/Validator';
import pool from '../model/database';
import Hash from '../utils/HashUtility';
import moment from 'moment';

exports.login = (req: any, res: any) => {
    // Sanitize
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).send("Invalid input");
    }

    if (Validator.isEmail(req.body.email) === false) 
        return res.status(400).send("Invalid email address");

    const query = "SELECT * FROM Users WHERE email = $1 AND role = 'superuser' LIMIT 1";

    pool.query(query, [req.body.email], async (err: string, result: { rows: any; }) => {
        if (err) {
            console.error('Error executing query', err); 
            return res.status(400).send(err); 
        }
        if (result && result.rows && result.rows.length > 0) {
            const user = result.rows[0];
            const hasher = new Hash();
            const isValid = await hasher.comparePassword(req.body.password, user.password);
            req.session.user = undefined;
            if (isValid) {
                req.session.user = {
                    email: user.email,
                    authenticated: true,
                    id: user.id,
                    userType: 'Admin'
                };
                return res.status(200).send('Logged in successfully');
            } else {
                return res.status(400).send('Invalid credentials');
            }
        } else {
             // User is not an admin account
            return res.status(400).send('User not found.');
        }
    });
};

exports.logout = (req: any, res: any) => {
    req.session.destroy((err: any) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }
        res.status(200).send('Logged out successfully');
    });
};


exports.createCheque = (req: any, res: any) => {
    // Sanitize 
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).send("Invalid input");
    }

    if (req.session.user === undefined || req.session.user.userType !== 'Admin') {
        return res.status(403).send('Unauthorized');
    }

    const query = "INSERT INTO cheques (chequenum, amount, date) VALUES ($1, $2, $3)";

    const { chequeNum, amount, Date  } = req.body;

    const formattedDate = moment(Date).format('YYYY-MM-DD');

    

    pool.query (query, [chequeNum, amount, formattedDate], (err: string, result: { rows: any; }) => {
        if (err) {
            console.error('An error has occured', err);

            if (process.env.ENV === 'debug') {
                return res.status(400).json({ error: err });
            }else {
                return res.status(400).json({ message: 'An error has occured' });
            }
        }else {
            return res.status(201).json({ message: 'Cheque created successfully' });
        }
    });
};

exports.updateUserStatus = (req: any, res: any) => {
    // Sanitize
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).send("Invalid input");
    }

    // Extract data from request
    const { first_name, last_name, status, userid } = req.body;


    // Update query
    const query = `
        UPDATE public.users 
        SET first_name = $1, last_name = $2, is_active = $3 
        WHERE id = $4
    `;

    // Execute query with parameters
    pool.query(query, [first_name, last_name, status, userid], (error: any, results: any) => {
        if (error) {
            console.error("Error executing query", error);
            return res.status(500).json("Internal server error");
        }
        res.status(200).json("User updated successfully");
    });
};