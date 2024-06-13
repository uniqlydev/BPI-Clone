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
router.get('/getUsers', UserController.getUser);
router.get('/login', UserController.login);
router.post('/img', imageUpload.single('image'), UserController.uploadImage);
module.exports = router;
