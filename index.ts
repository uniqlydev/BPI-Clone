import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import path from 'path'
import https from 'https'
import fs from 'fs'
import session from 'express-session'
import helmet from 'helmet'
import rate_limiter from 'express-rate-limit'
import * as crypto from 'crypto';


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
const limiter = rate_limiter({
  windowMs: 15 * 60 * 1000, // 1 minute
  max: 100 // limit each IP to 5 requests per windowMs
});

// Setup helmet to block XSS attacks
app.use(helmet());
app.use(limiter);


app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const secret = crypto.randomBytes(32).toString('hex');

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