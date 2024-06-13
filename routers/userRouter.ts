import express from 'express'
import path from 'path'
const router = express.Router()
const UserController = require('../controllers/UserController')

import multer from 'multer'

const imageUpload = multer({
    dest: 'images',
});

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, './uploads/');
//     },
//     filename: function (req, file, cb) {
//       cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//     },
//   });

// // Filter for the picture upload
// const fileFilter = (req: any, file: any, cb: any) => {
//     if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
//         cb(null, true);
//     } else {
//         cb(null, false);
//     }
// };

// // Multer upload
// const upload = multer(
//     {   storage: storage, 
//         fileFilter: fileFilter 
//     });

// Authorization 
router.post('/register', UserController.register);
router.get('/getUsers',UserController.getUser)
router.get('/login', UserController.login)
router.post('/img', imageUpload.single('image'), UserController.uploadImage);

module.exports = router