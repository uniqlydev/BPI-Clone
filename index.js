"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const express_session_1 = __importDefault(require("express-session"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const morgan_1 = __importDefault(require("morgan"));
// Loading SSL cert and key from dotenv
const private_key = fs_1.default.readFileSync(path_1.default.resolve(__dirname, 'server.key'), 'utf-8');
const certificate = fs_1.default.readFileSync(path_1.default.resolve(__dirname, 'server.cert'), 'utf8');
// Set up SSL
const server_credentials = {
    key: private_key,
    cert: certificate
};
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use((0, morgan_1.default)('dev'));
// Setup rate limiter to prevent brute force attacks
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 3, // limit each IP to 3 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use((0, cors_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(__dirname, 'views'));
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
try {
    app.use((0, express_session_1.default)({
        secret: process.env.SESSION_SECRET || require('crypto').randomBytes(64).toString('hex'),
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: true,
            httpOnly: true,
            maxAge: 3600000 // last for only 1 hour
        }
    }));
}
catch (e) {
    console.error('Error setting up session:', e);
    throw new Error('Failed to set up session');
}
// app.use('/api', apiLimiter);
// Routes
app.use('/api/users', require('./routers/userRouter'));
app.get('/', async (req, res) => {
    console.log('Session:', req.session.user);
    res.render('index');
});
app.get('/register', (req, res) => {
    res.render('register');
});
app.get('/profile', (req, res) => {
    res.render('upload');
});
const httpsServer = https_1.default.createServer(server_credentials, app);
httpsServer.listen(443, () => {
    console.log('HTTPS Server running on port 443');
});
