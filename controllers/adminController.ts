import { body, validationResult } from 'express-validator';
import Validator from '../utils/Validator';
import pool from '../model/database';
import Hash from '../utils/HashUtility';


exports.login = (req: any, res: any) => {
    // Sanitize
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).send("Invalid input");
    }

    if (Validator.isEmail(req.body.email) === false) 
        return res.status(400).send("Invalid email address");

    const query = "SELECT * FROM Users WHERE email = $1 AND role = 'superuser'";

    pool.query(query, [req.body.email], async (err: string, result: { rows: any; }) => {
        if (err) {
            console.error('Error executing query', err); 
            return res.status(400).send(err); 
        }
        if (result && result.rows && result.rows.length > 0) {
            const user = result.rows[0];
            const hasher = new Hash();
            const isValid = await hasher.comparePassword(req.body.password, user.password);
            if (isValid) {
                req.session.admin_authenticated = true;
                req.session.admin = user;
                req.session.save((err: any) => {
                    if (err) {
                        
                        return res.status(500).send('Internal Server Error');
                    }
                    res.status(201).json({ message: 'Login successful' });
                });
            } else {
                return res.status(400).send('Invalid credentials');
            }
        } else {
             // User is not an admin account
            return res.status(400).send('User not found.');
        }
    });
};

