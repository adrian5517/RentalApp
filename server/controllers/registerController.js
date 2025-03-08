const express = require("express");

const signUp = async (req, res) => {
    try {
      const { email, password, name } = req.body;
  
      console.log('Registration attempt:', { email, name }); // Log registration attempt
  
      if (!email || !password || !name) {
        console.log('Missing required fields:', { email: !!email, password: !!password, name: !!name });
        return res.status(400).json({ message: 'Please provide all required fields' });
      }
  
      // Check if user exists
      const [existingUser] = await db.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
  
      console.log('Existing user check:', { exists: existingUser.length > 0 });
  
      if (existingUser.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      console.log('Attempting to insert new user');
  
      // Create user
      const [result] = await db.query(
        'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
        [email, hashedPassword, name]
      );
  
      console.log('User inserted:', { userId: result.insertId });
  
      const token = jwt.sign({ id: result.insertId }, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });
  
      // Get the created user
      const [newUser] = await db.query(
        'SELECT id, email, name FROM users WHERE id = ?',
        [result.insertId]
      );
  
      console.log('Registration successful:', { userId: result.insertId });
  
      res.json({ 
        message: 'Registration successful',
        token,
        user: newUser[0]
      });
    } catch (error) {
      console.error('Registration error:', error);
      // Send more detailed error message
      res.status(500).json({ 
        message: 'Server error during registration',
        error: error.message 
      });
    }
  }

  module.exports = signUp;