const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); // Import Mongoose
const passport = require('passport'); // Import Passport for authentication
const LocalStrategy = require('passport-local').Strategy; // Use Passport's local strategy
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 80;

// MongoDB Connection
mongoose.connect(process.env.AZURE_COSMOS_CONNECTIONSTRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Mongoose User Model
const User = mongoose.model('User', {
  username: String,
  email: String,
  password: String,
});

app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  { usernameField: 'email' },
  (email, password, done) => {
    User.findOne({ email }, (err, user) => {
      if (err) return done(err);
      if (!user) return done(null, false, { message: 'Incorrect email.' });
      if (user.password !== password) return done(null, false, { message: 'Incorrect password.' });
      return done(null, user);
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/loginpage', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'loginpage.html'));
});

app.post('/chatGPTRequest', (req, res) => {
    fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY, // Replace with your actual API key
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
    })
        .then(response => response.json())
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch data from other service' });
        });
});

// Registration Route
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  const newUser = new User({ username, email, password });

  newUser.save((err, user) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to register user.' });
    } else {
      res.json({ message: 'Registration successful.' });
    }
  });
});

// Login Route
app.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ message: 'Login successful.' });
});

// Logout Route
app.get('/logout', (req, res) => {
  req.logout();
  res.json({ message: 'Logout successful.' });
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
