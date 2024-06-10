"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const crypto = __importStar(require("crypto"));
const csurf_1 = __importDefault(require("csurf"));
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
// Setup rate limiter to prevent brute force attacks
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 3, // limit each IP to 3 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
// Setup helmet to block XSS attacks
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(__dirname, 'views'));
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
const secret = crypto.randomBytes(32).toString('hex');
try {
    app.use((0, express_session_1.default)({
        secret: secret,
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: true,
            httpOnly: true,
            maxAge: 3600000 // last for only 1 hour
        }
    }));
    app.use((0, csurf_1.default)());
}
catch (e) {
    console.error('Error setting up session:', e);
    throw new Error('Failed to set up session');
}
app.use('/api', apiLimiter);
// Routes
app.use('/api/users', require('./routers/userRouter'));
app.get('/', async (req, res) => {
    res.render('index');
});
app.get('/register', (req, res) => {
    res.render('register');
});
const httpsServer = https_1.default.createServer(server_credentials, app);
httpsServer.listen(443, () => {
    console.log('HTTPS Server running on port 443');
});
