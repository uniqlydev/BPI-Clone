import { validationResult } from 'express-validator';
import Validator from '../utils/Validator';
import pool from '../model/database';
import Hash from '../utils/HashUtility';
import moment from 'moment';
import logger from '../utils/Logger';
import InputCleaner from '../utils/InputCleaner';

exports.login = (req: any, res: any) => {
    logger.info('POST /api/admin/login: Request received at ' + new Date().toISOString());

    // Sanitize
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn('POST /api/admin/login: Validation errors - ' + JSON.stringify(errors.array()));
        return res.status(400).send("Invalid input");
    }

    if (!Validator.isEmail(req.body.email)) {
        logger.warn('POST /api/admin/login: Invalid email address - ' + req.body.email);
        return res.status(400).send("Invalid email address");
    }

    const query = "SELECT * FROM Users WHERE email = $1 AND role = 'superuser' LIMIT 1";

    pool.query(query, [req.body.email], async (err: string, result: { rows: any; }) => {
        if (err) {
            logger.error('POST /api/admin/login: Error executing query - ' + err);
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

                logger.info('POST /api/admin/login: ' + req.session.user.email + ' logged in successfully');
                return res.status(200).send('Logged in successfully');
            } else {
                logger.error('POST /api/admin/login: Invalid credentials for email - ' + req.body.email);
                return res.status(400).send('Invalid credentials');
            }
        } else {
            logger.error('POST /api/admin/login: User not found for email - ' + req.body.email);
            return res.status(400).send('User not found.');
        }
    });
};

exports.createCheque = async (req: any, res: any) => {
    logger.info('POST /api/admin/createcheque: Request received at ' + new Date().toISOString());

    // Sanitize input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn('POST /api/admin/createcheque: Validation errors - ' + JSON.stringify(errors.array()));
        return res.status(400).send("Invalid input");
    }

    if (!req.session.user || req.session.user.userType !== 'Admin') {
        logger.warn('POST /api/admin/createcheque: Unauthorized access attempt');
        return res.status(403).send('Unauthorized');
    }

    const query = "INSERT INTO cheques (chequenum, amount, date) VALUES ($1, $2, $3)";
    const { chequeNum, amount, date } = req.body;
    const formattedDate = moment(date).format('YYYY-MM-DD');

    try {
        const client = await pool.connect();
        const values = [parseInt(chequeNum), parseFloat(amount), formattedDate];
        await client.query(query, values);
        client.release();

        logger.info('POST /api/admin/createcheque: Cheque created successfully - chequeNum: ' + chequeNum);
        return res.status(201).json({ message: 'Cheque created successfully' });
    } catch (err) {
        logger.error('POST /api/admin/createcheque: An error has occurred - ' + err);
        if (process.env.ENV === 'debug') {
            return res.status(400).json({ error: err });
        } else {
            return res.status(400).json({ message: 'An error has occurred' });
        }
    }
};

exports.updateUserStatus = (req: any, res: any) => {
    logger.info('POST /api/admin/updateUserStatus: Request received at ' + new Date().toISOString());

    // Sanitize
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn('POST /api/admin/updateUserStatus: Validation errors - ' + JSON.stringify(errors.array()));
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
    pool.query(query, [InputCleaner.cleanName(first_name), InputCleaner.cleanName(last_name), InputCleaner.cleanStatus(status), userid], (error: any, results: any) => {
        if (error) {
            logger.error('POST /api/admin/updateUserStatus: Error updating user - ' + error.message);
            console.error("Error executing query", error);
            return res.status(500).json("Internal server error");
        }

        logger.info('POST /api/admin/updateUserStatus: User updated successfully - userid: ' + userid);
        res.status(200).json("User updated successfully");
    });
};
