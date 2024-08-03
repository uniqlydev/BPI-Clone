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
import logger from './utils/Logger'



// Loading SSL cert and key from dotenv
const private_key = fs.readFileSync(path.resolve(__dirname, '../server.key'),'utf-8');
const certificate = fs.readFileSync(path.resolve(__dirname, '../server.cert'), 'utf8');


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
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 3, // limit each IP to 3 requests per windowMs
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
    saveUninitialized: true,
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


app.get('/admin', (req, res) => {
  if (req.session.user !== undefined && req.session.user.userType !== 'Admin') {
    res.render('status/status_403', { message: 'Unauthorized' });
  }else if (req.session.user !== undefined && req.session.user.userType === 'Admin') {
    res.render('admin_dashboard');
  }else {
    res.render('admin_login');
  }
});

app.get('/admin/dashboard', (req: any, res) => {

  console.log('Session:', req.session);
  if (req.session.user === undefined || req.session.user.userType !== 'Admin') {
    return res.render('status/status_403', { message: 'Unauthorized' });
  }

  res.render('admin_dashboard');
});


app.get('/admin/createcheque', (req: any, res) => {
  if (req.session.user === undefined || req.session.user.userType !== 'Admin') {
    return res.render('status/status_403', { message: 'Unauthorized' });
  }

  res.render('admin_cheque');
});



app.get('/admin/users', (req: any, res) => {
  if (req.session.user === undefined || req.session.user.userType !== 'Admin') {
    return res.render('status/status_403', { message: 'Unauthorized' });
  }

  const query = "SELECT id, first_name, last_name, is_active FROM users WHERE role='user'"

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


app.get('/transfer', (req: any, res) => {

  if (req.session.user === undefined || req.session.user.userType === 'Admin') {
    return res.render('status/status_403', {message: "Unforbidden access."});
  }else {
    res.render('function_transfer');
  }

});

app.get('/withdraw', (req: any, res) => {

  if (req.session.user === undefined || req.session.user.userType === 'Admin') {
    return res.render('status/status_403', {message: "Unforbidden access."});
  }else res.render('function_withdraw');
});

app.get('/deposit', (req: any, res) => {

  if (req.session.user === undefined || req.session.user.userType === 'Admin') {
    return res.render('status/status_403', {message: "Unforbidden access."});
  }else res.render('function_deposit');
});


app.get('/profilepicture', (req: any,res) => {

  if (req.session.user === undefined || req.session.user.userType === 'Admin') {
    return res.render('status/status_403', {message: "Unforbidden access."});
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

        logger.info(`${req.session.user.email} logged out at ${new Date()}`);
        req.session.destroy((err: Error) => {
            if (err) {
                logger.error('Error destroying session:', err);
            }
        });

        res.render('index');
    }
});


const httpsServer = https.createServer(server_credentials,app);

httpsServer.listen(443, () => {
  console.log('HTTPS Server running on port 443');
});
