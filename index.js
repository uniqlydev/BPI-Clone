const express = require('express')
const express_session = require('express-session')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const https = require('https')
const fs = require('fs')


// Loading SSL cert and key from dotenv
const private_key = fs.readFileSync(path.resolve(__dirname, 'server.key'),'utf-8');
const certificate = fs.readFileSync(path.resolve(__dirname, 'server.cert'), 'utf8');


const server_credentials = {
  key: private_key,
  cert: certificate
}

const app = express()
app.use(bodyParser.json())


app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));


// Routes
app.use('/api/users', require('./routers/userRouter'));


app.get('/', async (req, res) => {
    
    res.render('index');
});

app.get('/register', (req, res) => {
    res.render('register');
});

const httpsServer = https.createServer(server_credentials,app);

httpsServer.listen(443, () => {
  console.log('HTTPS Server running on port 443');
});