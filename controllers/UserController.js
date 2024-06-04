const User = require('../model/User');
const pool = require('../model/database');
const IDGenerator = require('../model/IDGenerator');
const bcrypt = require('bcrypt');



exports.register = (req, res) => {
    const idGen = new IDGenerator();
    const { first_name, last_name, email, password, phone_number } = req.body;
    const id = idGen.generateID();

    const query = "INSERT INTO Users(id, first_name, last_name, email, password, phone_number) VALUES($1, $2, $3, $4, $5, $6) RETURNING *";
    const user = new User(id, first_name, last_name, email, password, phone_number);

    pool.query(query, [user.id, user.first_name, user.last_name, user.email, user.password, user.phone_number], (err, result) => {
        if (err) {
            console.error('Error executing query', err.stack); // Log the error for debugging
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