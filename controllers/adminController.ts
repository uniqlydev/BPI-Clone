import { body, validationResult } from 'express-validator';
import Validator from '../utils/Validator';
import pool from '../model/database';
import Hash from '../utils/HashUtility';
import moment from 'moment';
import logger from '../utils/Logger';

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
            logger.error('Error executing query', err , + "POST /api/admin/login" + " - " + Date.now());
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

                logger.info( req.session.user.email + ' logged in successfully', + "POST /api/admin/login" + " - " + Date.now());
                return res.status(200).send('Logged in successfully');
            } else {
                logger.error('Invalid credentials', + "POST /api/admin/login" + " - " + Date.now());
                return res.status(400).send('Invalid credentials');
            }
        } else {
             // User is not an admin account

            logger.error('User not found', + "POST /api/admin/login" + " - " + Date.now());
            return res.status(400).send('User not found.');
        }
    });
};

exports.createCheque = async (req: any, res: any) => {
    // Sanitize input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send("Invalid input");
    }

    if (!req.session.user || req.session.user.userType !== 'Admin') {
        return res.status(403).send('Unauthorized');
    }

    const query = "INSERT INTO cheques (chequenum, amount, date) VALUES ($1, $2, $3)";
    const { chequeNum, amount, date } = req.body;
    const formattedDate = moment(date).format('YYYY-MM-DD');

    try {
        const client = await pool.connect();
        const values = [chequeNum, amount, formattedDate];
        await client.query(query, values);
        client.release();

        logger.info('Cheque created successfully', { endpoint: "POST /api/admin/createcheque", timestamp: Date.now() });
        return res.status(201).json({ message: 'Cheque created successfully' });
    } catch (err) {
        console.error('An error has occurred', err);
        logger.error('An error has occurred', { error: err, endpoint: "POST /api/admin/createcheque", timestamp: Date.now() });

        if (process.env.ENV === 'debug') {
            return res.status(400).json({ error: err });
        } else {
            return res.status(400).json({ message: 'An error has occurred' });
        }
    }
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
            logger.error('Error updating user', error , + "POST /api/admin/updateUserStatus" + " - " + Date.now());
            console.error("Error executing query", error);
            return res.status(500).json("Internal server error");
        }

        logger.info('User updated successfully', + "POST /api/admin/updateUserStatus" + " - " + Date.now());
        res.status(200).json("User updated successfully");
    });
};
