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
            // Remove user: { email: 'bomber8183@gmail.com', authenticated: true }, from session
            req.session.user = undefined;
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

    const query = "UPDATE public.users SET is_active = $1 WHERE id = $2";

    let { status, id } = req.body;

    console.log("HELLO WORLD");

    return res.status(201).json({ message: req.body });


    // if (status === 'active') {
    //     status = true
    // }else if (status === 'inactive') status = false;

    // console.log(req.body.status);

    // pool.query(query, [status, id], (err: string, result: { rows: any; }) => {
    //     if (err) {
    //         console.error('An error has occured', err);

    //         if (process.env.ENV === 'debug') {
    //             return res.status(400).json({ error: err });
    //         }else {
    //             return res.status(400).json({ message: 'An error has occured' });
    //         }
    //     }else {
    //         return res.status(201).json({ message: 'User status updated successfully' });
    //     }
    // });
};