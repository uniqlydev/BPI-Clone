import express from 'express'
import path from 'path'
import fs from 'fs';

const router = express.Router()
const UserController = require('../controllers/UserController')

import multer from 'multer';
import { isAuthenticatedUser } from '../middleware/authenticator';

const storage = multer.memoryStorage();
const imageUpload = multer({
    storage: storage,
    dest: 'images',
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            console.log('File is allowed');
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

router.post('/img', isAuthenticatedUser ,imageUpload.single('image'), UserController.uploadImage);
router.post('/deposit', isAuthenticatedUser ,UserController.deposit);
router.post('/withdraw', isAuthenticatedUser ,UserController.withdraw);
router.post('/profile/update', isAuthenticatedUser, UserController.updateProfile);

module.exports = router
