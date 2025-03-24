import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import path from 'path'
import https from 'https'
import fs from 'fs'
import session from 'express-session'
import rate_limiter from 'express-rate-limit'
import morgan from 'morgan'
import pool from './model/database'
import User from './model/User'
// import logger from './utils/Logger'
import mfaRouter from './routers/mfaRouter'



// Loading SSL cert and key from dotenv
const private_key = fs.readFileSync(path.resolve(__dirname, '../server.key'),'utf-8');
const certificate = fs.readFileSync(path.resolve(__dirname, '../server.crt'), 'utf8');


// Set up SSL
const server_credentials = {
  key: private_key,
  cert: certificate
}

const app = express()
app.use(bodyParser.json())
app.use(morgan('dev'));



// Setup rate limiter to prevent brute force attacks
const apiLimiter = rate_limiter({
  windowMs: 15 * 60 * 1000, // 1 minute
  max: 10000, // limit each IP to 3 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});



app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));



try {
  // User
  app.use(session({
    secret: process.env.SESSION_SECRET || require('crypto').randomBytes(16).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      httpOnly: true,
      maxAge: 3600000 // last for only 1 hour
    }
  }))
}catch (e) {
  console.error('Error setting up session:', e);
  throw new Error('Failed to set up session');
}

app.use('/api', apiLimiter);

// Routes
app.use('/api/users', require('./routers/userRouter'));
app.use('/api/admin', require('./routers/adminRouter'));
app.use('/mfa', mfaRouter);


app.get('/', async (req: any, res: { render: (arg0: string) => void }) => {

  console.log('Session:', req.session.user);

  if (req.session.user === undefined) {
    res.render('index');
  }else if (req.session.user.userType === 'Admin') {
    // Redirect to admin dashboard
    res.render('admin_dashboard');
  }else {
    res.render('function_deposit');
  }
});

app.get('/register', (req: any, res: { render: (arg0: string) => void }) => {
    console.log('Session:', req.session);
    res.render('register');
});

//added consideration for acctad here 
app.get('/admin', (req, res) => {
  if (req.session.user !== undefined && req.session.user.userType !== 'Admin') {
    res.render('status/status_403', { message: 'Unauthorized' });
  }else if (req.session.user !== undefined && req.session.user.userType === 'transacad') {
    res.render('admin_dashboard');
  }else if (req.session.user !== undefined && req.session.user.userType === 'acctad') {
    res.render('acct_admin_dashboard');
  }else {
    res.render('admin_login');
  }
});


app.get('/admin/dashboard', (req: any, res) => {

  console.log('Session:', req.session);
  if (req.session.user === undefined || req.session.user.userType !== 'transacad') {
    return res.render('status/status_403', { message: 'Unauthorized' });
  }

  res.render('admin_dashboard');
});



app.get('/acctadmin/dashboard', (req: any, res) => {

  console.log('Session:', req.session);
  
  if (req.session.user === undefined || req.session.user.userType !== 'acctad') {
    return res.render('status/status_403', { message: 'Unauthorized' });
  }

  res.render('acct_admin_dashboard');
});



app.get('/admin/createcheque', (req: any, res) => {
  if (req.session.user === undefined || req.session.user.userType !== 'transacad') {
    return res.render('status/status_403', { message: 'Unauthorized' });
  }

  res.render('admin_cheque');
});



app.get('/admin/users', (req: any, res) => {
  if (req.session.user === undefined || req.session.user.userType !== 'acctad') {
    return res.render('status/status_403', { message: 'Unauthorized' });
  }

  const query = "SELECT u.id, u.first_name, u.last_name, u.is_active, t.flagged, t.id AS transactionID, t.type FROM users u join transactions t on u.id = t.accountnumber WHERE role='user'"

  pool.query(query, (err: string, result: { rows: any; }) => {
    if (err) {
      console.error('Error executing query', err);
      return res.status(500).send('Internal Server Error');
    }

    if (result && result.rows && result.rows.length > 0) {
      const users = result.rows;

      console.log(users);

      res.render('admin_users', { users });
    } else {
      res.render('admin_users', { users: [] });
    }
  });
});

app.get('/otp', (req: any, res) => {
  if (req.session.user === undefined || req.session.user.userType === 'Admin') {
    return res.render('status/status_403', {message: " Unauthorized access."});
  } else res.render('otp');
});

app.get('/admin_otp', (req: any, res) => {
  if (req.session.user === undefined || req.session.user.userType === 'Admin') {
    return res.render('status/status_403', {message: "Unforbidden access."});
  } else res.render('admin_otp');
});

app.get('/transfer', (req: any, res) => {

  if (req.session.user === undefined || req.session.user.userType === 'Admin') {
    return res.render('status/status_403', {message: " Unauthorized access."});
  }else {
    res.render('function_transfer');
  }

});

app.get('/withdraw', (req: any, res) => {

  if (req.session.user === undefined || req.session.user.userType === 'Admin') {
    return res.render('status/status_403', {message: " Unauthorized access."});
  }else res.render('function_withdraw');
});

app.get('/deposit', (req: any, res) => {

  if (req.session.user === undefined || req.session.user.userType === 'Admin' || req.session.user.otp === '') {
    return res.render('status/status_403', {message: "Unauthorized access."});
  }else res.render('function_deposit');
});


app.get('/profilepicture', (req: any,res) => {

  if (req.session.user === undefined || req.session.user.userType === 'Admin') {
    return res.render('status/status_403', {message: " Unauthorized access."});
  }else res.render('upload');
});

app.get('/profile', async (req: any,res) => {
    if (req.session.user === undefined || req.session.user.userType === 'Admin') {
        return res.render('status/status_403', {
            message: 'Unauthorized'
        })
    }

    const query = 'SELECT * FROM public.users WHERE email = $1';
    const values = [req.session.user.email];

    try {
        const result = await pool.query(query, values);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            const newUser = new User(user.id, user.first_name, user.last_name, user.email, user.password, user.phone_number, user.profile_picture);

            return res.render('profile', { user: newUser });
        } else {
            return res.render('status/status_404', {
                message: 'User not found'
            })
        }
    } catch (error) {
        console.error('Error executing query:', error);
        return res.render('status/status_500', {
            message: "Massive problem. LIKE HUGE"
        });
    }
});

app.get('/logout', (req, res) => {
    if (!req.session || !req.session.user) {
        return res.render('status/status_403', {
            message: 'Unauthorized'
        });
    } else {

        // logger.info(`${req.session.user.email} logged out at ${new Date()}`);
        req.session.destroy((err: Error) => {
            if (err) {
                // logger.error('Error destroying session:', err);
            }
        });

        res.render('index');
    }
});

app.get('/transactions', async (req, res) => {
    // Check if the user is authenticated and is not an Admin
    if (!req.session?.user?.authenticated || req.session?.user?.userType === 'Admin') {
        // logger.error('GET /transactions: Unauthorized access attempt');
        return res.render('status/status_403', {
            message: 'Unauthorized'
        });
    }

    // Get a connection from the pool
    const client = await pool.connect();

    const query = `
        SELECT
            CASE
                WHEN x.type = 'D' THEN t.amountdeposited
                ELSE 0
            END AS amountdeposited,
            CASE
                WHEN x.type = 'W' THEN w.amountwithdrawn
                ELSE 0
            END AS amountwithdrawn,
            t.chequenum,
            x.type
        FROM
            deposits t
            JOIN withdraw w ON t.accountnumber = w.accountnumber
            JOIN transactions x ON t.accountnumber = x.accountnumber
            INNER JOIN users a ON t.accountnumber = a.id
        WHERE
            a.email = $1
        ORDER BY
            x.type;
    `;


    try {
        // Execute the query with the user's email
        const result = await client.query(query, [req.session.user.email]);

        if (result.rows.length > 0) {
            // Render the transactions page with the retrieved data
            res.render('transactions', {
                transactions: result.rows
            });
        } else {
            // Render the transactions page with an empty array if no transactions found
            res.render('transactions', {
                transactions: []
            });
        }
    } catch (err) {
        // Log the error and return a 500 status
        // logger.error(`GET /transactions: Error retrieving transactions - ${err}`);
        res.status(500).json({ message: "An error occurred while retrieving transactions" });
    } finally {
        // Release the client back to the pool
        client.release();
    }
});






app.get('/adminTransactions', async (req, res) => {
  if (req.session.user === undefined || req.session.user.userType !== 'transacad') {
    return res.render('status/status_403', { message: 'Unauthorized' });
  }

  const client = await pool.connect();

  const query = `
      SELECT 
          x.id AS transaction_id, 
          u.email AS user_email, 
          CASE WHEN x.type = 'D' THEN t.amountdeposited ELSE 0 END AS amountdeposited,
          CASE WHEN x.type = 'W' THEN w.amountwithdrawn ELSE 0 END AS amountwithdrawn,
          t.chequenum, x.flagged,
          x.type
      FROM 
          deposits t
          JOIN withdraw w ON t.accountnumber = w.accountnumber
          JOIN transactions x ON t.accountnumber = x.accountnumber
          JOIN users u ON t.accountnumber = u.id
      ORDER BY 
          x.type;
  `;

  try {
      const result = await client.query(query);
      res.render('admin_transactions', { transactions: result.rows });
  } catch (err) {
      res.status(500).json({ message: "An error occurred while retrieving transactions" });
  } finally {
      client.release();
  }
});

// Route to report a transaction
app.post('/adminTransactions/report', async (req, res) => {
  if (req.session.user === undefined || req.session.user.userType !== 'transacad') {
    return res.render('status/status_403', { message: 'Unauthorized' });
  }

  const { transaction_id } = req.body; // Get transaction ID from the frontend
  const client = await pool.connect();

  try {
      const query = `UPDATE transactions SET flagged = true WHERE id = $1`;
      await client.query(query, [transaction_id]);

      res.json({ success: true, message: "Transaction flagged successfully" });
  } catch (err) {
      res.status(500).json({ message: "Error flagging transaction" });
  } finally {
      client.release();
  }
});






const httpsServer = https.createServer(server_credentials,app);

httpsServer.listen(443, () => {
  console.log('HTTPS Server running on port 443');
});
