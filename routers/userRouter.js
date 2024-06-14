"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
const UserController = require('../controllers/UserController');
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
const imageUpload = (0, multer_1.default)({
    storage: storage,
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
router.post('/login', UserController.login);
router.post('/img', imageUpload.single('image'), (req, res) => {
    console.log(req.file !== undefined ? req.file : 'No file uploaded');
    // Save the file to /images
    const destination = path_1.default.join(__dirname, '../images'); // Specify your destination directory
    const filename = Date.now() + '-' + req.file.originalname;
    fs_1.default.writeFile(path_1.default.join(destination, filename), req.file.buffer, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error saving image.');
        }
        console.log('File saved successfully:', filename);
        // Optionally, you can respond with JSON containing the file path or other metadata
        res.status(200).json({
            message: 'File uploaded successfully',
            filePath: path_1.default.join('/images', filename),
        });
    });
});
module.exports = router;
