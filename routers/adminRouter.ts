import express from 'express'
const router = express.Router()
const adminController = require('../controllers/adminController')

// Authorization
router.post('/login', adminController.login)
router.post('/createcheque', adminController.createCheque)
router.post('/updateuser', adminController.updateUserStatus)

module.exports = router
