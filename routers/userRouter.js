"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const UserController = require('../controllers/UserController');
const multer_1 = __importDefault(require("multer"));
const imageUpload = (0, multer_1.default)({
    dest: 'images',
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Only JPEG, PNG, and JPG files are allowed.'));
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 10, // 10 MB limit (adjust as necessary)
    },
});
// Authorization 
router.post('/register', UserController.register);
router.get('/getUsers', UserController.getUser);
router.get('/login', UserController.login);
router.post('/img', imageUpload.single('image'), UserController.uploadImage);
module.exports = router;
