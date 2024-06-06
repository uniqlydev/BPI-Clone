const express = require('express')
const router = express.Router()
const UserController = require('../controllers/UserController')

// Authorization 




router.post('/register', UserController.register)
router.get('/getUsers', UserController.getUser)

module.exports = router