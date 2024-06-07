import User from '../model/User';
import pool from '../model/database';
import IDGenerator from '../utils/IDGenerator';
import Hash from '../utils/HashUtility';
import Validator from '../utils/Validator';
import { body, validationResult } from 'express-validator';




const validate_sanitize = [
    body('email').isEmail().withMessage("Invalid email address").normalizeEmail(),
    body('password').isStrongPassword(),
    body('phone_number').isMobilePhone('en-PH').withMessage("Number is not a valid phone number").trim().escape(),
    body('first_name').isString().trim().escape(),
    body('last_name').isString().trim().escape()
];


exports.register =  async (req: { body: { password: string; first_name?: string; last_name?: string; email?: string; phone_number?: string; confirm_password?: string }; }, res: { status: (arg0: number) => { (): any; new(): any; send: { (arg0: string): any; new(): any; }; }; }) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send("Invalid input");
    }

    const hasher = new Hash();
    const idGen = new IDGenerator();
    const { first_name, last_name, email, password, phone_number, confirm_password } = req.body as { password: string; first_name?: string; last_name?: string; email?: string; phone_number?: string; confirm_password?: string};

    // Check if the password and confirm password match
    if (password !== confirm_password) {
        return res.status(400).send('Passwords do not match.');
    }

    try {
        const hashed_password = await hasher.hashPassword(password);

        const id = idGen.generateID();
    
        const query = "INSERT INTO Users(id, first_name, last_name, email, password, phone_number) VALUES($1, $2, $3, $4, $5, $6) RETURNING *";
        const user = new User(id, first_name!, last_name!, email!, hashed_password!, phone_number!);
    
        pool.query(query, [user.getID(), user.getFirstName(), user.getLastName(), user.getEmail(), user.getPassword(), user.getPhone()], (err: string, result: { rows: string | any[]; }) => {
            if (err) {
                console.error('Error executing query', err); // Log the error for debugging
                return res.status(400).send(err); // Send the error in the response
            }
            if (result && result.rows && result.rows.length > 0) {
                return res.status(201).send(`User added with ID: ${result.rows[0].password}`);
            } else {
                console.error('No rows returned'); // Log the issue for debugging
                return res.status(400).send('User could not be added.');
            }
        });
    }catch(err){
        console.error('Error executing query', err); // Log the error for debugging
        return res.status
    }
};




exports.getUser = (req:any,res: any) => {
    // Retrieve all users
    const query = "SELECT email FROM Users;"

    pool.query(query, (err: string, result: { rows: any; }) => {
        if (err) {
            console.error('Error executing query', err); // Log the error for debugging
            return res.status(400).send(err); // Send the error in the response
        }
        if (result && result.rows && result.rows.length > 0) {
            return res.status(200).send(result.rows);
        } else {
            console.error('No rows returned'); // Log the issue for debugging
            return res.status(400).send('No users found.');
        }
    });
};


// exports.login = (req: { body: { email: String; password: String; }; }, res: { status: (arg0: number) => { (): any; new(): any; send: { (arg0: string): any; new(): any; }; }; }) => {
//     const { email, password } = req.body;

//     const query = "SELECT * FROM Users WHERE email = $1";
    
//     pool.query(query, [email], (err: string, result: { rows: string | any[]; }) => {
//         if (err) {
//             console.error('Error executing query', err); // Log the error for debugging
//             return res.status(400).send(err); // Send the error in the response
//         }
//         if (result && result.rows && result.rows.length > 0) {
//             const user = result.rows[0];
//             bcrypt.compare(password, user.password, (err: any, isMatch: any) => {
//                 if (err) {
//                     console.error('Error comparing passwords', err); // Log the error for debugging
//                     return res.status(500).send('Server error'); // Send a server error response
//                 }
//                 if (isMatch) {
//                     // Passwords match
//                     return res.status(200).send(`User logged in with ID: ${user.id}`);
//                 } else {
//                     // Passwords do not match
//                     console.error('Invalid email or password'); // Log the issue for debugging
//                     return res.status(400).send('Invalid email or password.');
//                 }
//             });
//         } else {
//             // No user found with the given email
//             console.error('Invalid email or password'); // Log the issue for debugging
//             return res.status(400).send('Invalid email or password.');
//         }
//     });
// };

