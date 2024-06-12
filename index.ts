import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import path from 'path'
import https from 'https'
import fs from 'fs'
import session from 'express-session'
import helmet from 'helmet'
import rate_limiter from 'express-rate-limit'



// Loading SSL cert and key from dotenv
const private_key = fs.readFileSync(path.resolve(__dirname, 'server.key'),'utf-8');
const certificate = fs.readFileSync(path.resolve(__dirname, 'server.cert'), 'utf8');


// Set up SSL
const server_credentials = {
  key: private_key,
  cert: certificate
}

const app = express()
app.use(bodyParser.json())

// Setup rate limiter to prevent brute force attacks
const apiLimiter = rate_limiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 3, // limit each IP to 3 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Setup helmet to block XSS attacks
app.use(helmet());


app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const secret = process.env.SESSION_SECRET

try {
  app.use(session({
    secret: secret,
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


app.get('/', async (req: any, res: { render: (arg0: string) => void }) => {
    
    res.render('index');
});

app.get('/register', (req: any, res: { render: (arg0: string) => void }) => {
    res.render('register');
});

const httpsServer = https.createServer(server_credentials,app);

httpsServer.listen(443, () => {
  console.log('HTTPS Server running on port 443');
});