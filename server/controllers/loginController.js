const express = require("express");


const signIn =  async (req, res) => {
    try {
      const { email, password } = req.body;
  
      console.log('Login attempt:', { email }); // Log login attempt
  
      // Check if user exists
      const [users] = await db.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
  
      if (users.length === 0) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      const user = users[0];
  
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });
  
      const userData = {
        id: user.id,
        email: user.email,
        name: user.name
      };
  
      console.log('Login successful:', { userId: user.id });
  
      res.json({ 
        message: 'Login successful',
        token,
        user: userData
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        message: 'Server error during login',
        error: error.message 
      });
    }
  }

  module.exports = signIn