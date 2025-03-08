const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const Signin = require('../controllers/loginController');
const Signup = require('../controllers/registerController')

// Register
router.post('/register', Signup );

// Login
router.post('/login', Signin );


module.exports = router;

