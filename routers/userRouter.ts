import express from 'express'
import path from 'path'
import fs from 'fs';

const router = express.Router()
const UserController = require('../controllers/UserController')

import multer from 'multer';

const storage = multer.memoryStorage();
const imageUpload = multer({
    storage: storage,
    dest: 'images',
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, and JPG files are allowed.'));
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 10, // 10 MB limit (adjust as necessary)
    },
});

// Authorization 
router.post('/register', UserController.register);
router.post('/login', UserController.login)
router.post('/img', imageUpload.single('image'), UserController.uploadImage);

module.exports = router