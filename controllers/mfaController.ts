import { Request, Response } from 'express';
import '../model/mfa';
import pool from '../model/database';
// import logger from '../utils/Logger';

export interface mfa {
    id?: number;
    email: String;
    code: String;
    expires_at: Date;
    used_at?: Date;
    created_at?: Date;
}

export async function insertMFA(mfa: mfa) {
    
    try {
        const query = `INSERT INTO mfa (email, code, expires_at) VALUES ($1, $2, $3)`;
        const values = [mfa.email, mfa.code, mfa.expires_at];
        await pool.query(query, values);
    } catch (error) {
        if (process.env.ENV === 'debug') {
            // logger.info("Error: ", error);
        }
    }
}

export async function hasValidMFA(email: String) {
    const query = `SELECT * FROM mfa WHERE email = '` + email + `' AND NOW() < expires_at AND used_at = null;`;
    const { rows } = await pool.query(query);
    // logger.info(rows);
    return rows != "";
}

export async function getMFA(email: String, code: string): Promise<mfa | null> {
    const query = `   
        SELECT * FROM mfa
        WHERE email = $1
        AND code = $2
        AND used_at IS NULL
        ORDER BY created_at DESC
        LIMIT 1`;
    const { rows } = await pool.query(query, [email, code]);
    return rows.length > 0 ? rows[0] : null;
}

export async function markMFACodeUsed(id: number): Promise<void> {
    const query = `UPDATE mfa SET used_at = NOW() WHERE id = $1`;
    await pool.query(query, [id]);
}

export async function whichAdminAccount(email: String) {
    const query = `SELECT role FROM users WHERE email = $1`;
    const { rows } = await pool.query(query, [email]);
    console.log(rows[0].role);
    return rows.length > 0 ? rows[0].role : null;
}

export async function verifyMFA(req: Request, res: Response) {
    const { code } = req.body;
    const userEmail = req.session.user?.email;

    // logger.info('POST /mfa/verify:  code: ' + code);
    // logger.info('POST /mfa/verify:  email: ' + userEmail);

    const mfaEntry = await getMFA(userEmail!.toString(), code);
    if (mfaEntry === null) {
        // logger.info('mfaEntry = ' + mfaEntry);
        return res.status(500).json({ message: 'Invalid or used code.' });
    }

    const now = new Date();
    if (now > new Date(mfaEntry!.expires_at)) {
        // logger.info('POST /mfa/verify:  mfaEntryDate: ' + mfaEntry.expires_at);
        return res.status(500).json({ message: 'Code has expired' });
    }

    await markMFACodeUsed(mfaEntry.id ?? 0);

    // Store OTP in session
    req.session.user = {
        email: req.session.user?.email || '',
        authenticated: true,
        userType: 'user',
        otp: code,
    };
    console.log('OTP: ', req.session.user.otp);

    return res.status(200).json({ message: 'Logged in successfully' });
};
