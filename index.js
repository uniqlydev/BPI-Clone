"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5 // limit each IP to 5 requests per windowMs
});
// Setup helmet to block XSS attacks
app.use((0, helmet_1.default)());
app.use(limiter);
app.use((0, cors_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(__dirname, 'views'));
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use((0, express_session_1.default)({
    secret: '123',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: true,
        httpOnly: true,
        maxAge: 3600000 // last for only 1 hour
    }
}));
// Routes
app.use('/api/users', require('./routers/userRouter'));
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render('index');
}));
app.get('/register', (req, res) => {
    res.render('register');
});
const httpsServer = https_1.default.createServer(server_credentials, app);
httpsServer.listen(443, () => {
    console.log('HTTPS Server running on port 443');
});
