import { register } from 'module';
import User from '../model/User';
const pool = require('../model/database');
const IDGenerator = require('../utils/IDGenerator');
const Hash = require('../utils/HashUtility')

exports.register = (req: { body: { password: String; first_name?: String; last_name?: String; email?: String; phone_number?: String; }; }, res: { status: (arg0: number) => { (): any; new(): any; send: { (arg0: string): any; new(): any; }; }; }) => {

    const hasher = new Hash();
    const idGen = new IDGenerator();
    const { first_name, last_name, email, password, phone_number } = req.body;

    const hashed_password = hasher.hashPassword(password);

    req.body.password = 'null'; // Setting to null

    console.log(hashed_password);


    const id = idGen.generateID();

    const query = "INSERT INTO Users(id, first_name, last_name, email, password, phone_number) VALUES($1, $2, $3, $4, $5, $6) RETURNING *";
    const user = new User(id, first_name!, last_name!, email!, hashed_password!, phone_number!);

    pool.query(query, [user.getID(), user.getFirstName(), user.getLastName(), user.getEmail(), user.getPassword(), user.getPhone()], (err: string, result: { rows: string | any[]; }) => {
        if (err) {
            console.error('Error executing query', err); // Log the error for debugging
            return res.status(400).send(err); // Send the error in the response
        }
        if (result && result.rows && result.rows.length > 0) {
            return res.status(201).send(`User added with ID: ${result.rows[0].id}`);
        } else {
            console.error('No rows returned'); // Log the issue for debugging
            return res.status(400).send('User could not be added.');
        }
    });
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
