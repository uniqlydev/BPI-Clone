const User = require('../model/User');
const pool = require('../model/database');
const IDGenerator = require('../utils/IDGenerator');
const Hash = require('../utils/HashUtility')

exports.register = (req: { body: { password: any; first_name?: any; last_name?: any; email?: any; phone_number?: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; send: { (arg0: string): any; new(): any; }; }; }) => {

    const hasher = new Hash();
    const idGen = new IDGenerator();
    const { first_name, last_name, email, password, phone_number } = req.body;


    const hashed_password = hasher.hashPassword(password);
    req.body.password = null; // Setting to null

    console.log(hashed_password);


    const id = idGen.generateID();

    const query = "INSERT INTO Users(id, first_name, last_name, email, password, phone_number) VALUES($1, $2, $3, $4, $5, $6) RETURNING *";
    const user = new User(id, first_name, last_name, email, hashed_password, phone_number);

    pool.query(query, [user.id, user.first_name, user.last_name, user.email, user.password, user.phone_number], (err: string, result: { rows: string | any[]; }) => {
        if (err) {
            console.error('Error executing query', err.); // Log the error for debugging
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