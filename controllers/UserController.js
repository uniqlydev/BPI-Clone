const User = require('../model/User');
const mysql = require('../model/database');

exports.register = (req, res) => {
    try {
        const con = mysql;

        const { first_name, last_name, email, phone, role } = req.body;

        const user = new User(null, first_name, last_name, email, phone, role, null);

        const query = 'INSERT INTO users SET ?';

        con.query(query, user, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Internal Server Error');
            }
            res.status(201).send('User registered');
        });
    }catch(err){
        console.log(err);
    }
};