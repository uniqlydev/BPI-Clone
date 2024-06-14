import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import path from 'path'
import https from 'https'
import fs from 'fs'
import session from 'express-session'
import rate_limiter from 'express-rate-limit'
import morgan from 'morgan'



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
    secret: process.env.SESSION_SECRET || require('crypto').randomBytes(64).toString('hex'),
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true,
      httpOnly: true,
      maxAge: 3600000 // last for only 1 hour
    }
  }))

  // Admin
  app.use(session
    ({
      secret: process.env.SESSION_SECRET_ADMIN || require('crypto').randomBytes(64).toString('hex'),
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

    console.log('Session:', req.session);

    res.render('index');
});

app.get('/register', (req: any, res: { render: (arg0: string) => void }) => {
    console.log('Session:', req.session);
    res.render('register');
});


app.get('/admin', (req: any, res: { render: (arg0: string) => void }) => {
  const adminSession = req.session;

  console.log('Admin session:', adminSession);

  res.render('admin_login');
});

app.get('/admin/dashboard', (req: any, res) => {
  const adminSession = req.session;

  console.log('Admin session:', adminSession);
  
  res.render('admin_dashboard');
});


app.get('/profile', (req: any, res: { render: (arg0: string) => void }) => {
  console.log('Session:', req.session);
  res.render('upload');
});
const httpsServer = https.createServer(server_credentials,app);

httpsServer.listen(443, () => {
  console.log('HTTPS Server running on port 443');
});