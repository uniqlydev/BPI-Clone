import express from 'express'
const router = express.Router()
const adminController = require('../controllers/adminController')

// Authorization 
router.post('/login', adminController.login)
router.post('/logout', adminController.logout)

module.exports = router