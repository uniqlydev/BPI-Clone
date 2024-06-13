import express from 'express'
const router = express.Router()
const adminController = require('../controllers/adminController')

// Authorization 
router.post('/login', adminController.login)

module.exports = router