import express from 'express'
import { isAuthenticatedAdmin } from '../middleware/authenticator'
const router = express.Router()
const adminController = require('../controllers/adminController')

// Authorization
router.post('/login', adminController.login)
router.post('/createcheque', isAuthenticatedAdmin ,adminController.createCheque)
router.post('/updateuser', isAuthenticatedAdmin ,adminController.updateUserStatus)

module.exports = router
