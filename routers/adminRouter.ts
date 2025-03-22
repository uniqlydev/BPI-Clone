import express from 'express'
import { isAuthenticatedTransacAdmin} from '../middleware/authenticator'
import {isAuthenticatedAcctAdmin} from '../middleware/authenticator'
const router = express.Router()
const adminController = require('../controllers/adminController')

// Authorization
router.post('/login', adminController.login)
router.post('/createcheque', isAuthenticatedTransacAdmin ,adminController.createCheque)
router.post('/updateuser', isAuthenticatedAcctAdmin ,adminController.updateUserStatus)

module.exports = router
