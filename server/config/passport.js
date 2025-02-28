const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./database');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const [rows] = await db.query(
          'SELECT * FROM users WHERE google_id = ?',
          [profile.id]
        );

        if (rows.length > 0) {
          return done(null, rows[0]);
        }

        const [result] = await db.query(
          'INSERT INTO users (google_id, email, name) VALUES (?, ?, ?)',
          [profile.id, profile.emails[0].value, profile.displayName]
        );

        const [newUser] = await db.query(
          'SELECT * FROM users WHERE id = ?',
          [result.insertId]
        );

        return done(null, newUser[0]);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
