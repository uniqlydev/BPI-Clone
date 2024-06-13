import express from 'express'
const router = express.Router()
const UserController = require('../controllers/UserController')

import multer from 'multer'

const storage = multer.diskStorage({
    destination: function (req: any, file: any, cb: any) {
        cb(null, 'uploads/')
    },
    filename: function (req: any, file: any, cb: any) {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

// Filter for the picture upload
const fileFilter = (req: any, file: any, cb: any) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

// Multer upload
const upload = multer({ storage: storage, fileFilter: fileFilter });

// Authorization 
router.post('/register', UserController.register, upload.single('profile_picture'));
router.get('/getUsers', UserController.getUser)
router.get('/login', UserController.login)

module.exports = router