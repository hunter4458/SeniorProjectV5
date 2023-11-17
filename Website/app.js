console.log('Starting the app');

const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const {MongoClient} = require('mongodb');
const bcrypt = require('bcryptjs');
const User = require('./user');
const crypto = require('crypto');
require('dotenv').config();
const app = express();



const secretKey = crypto.randomBytes(32).toString('hex');
console.log(secretKey);

app.use(session({
    secret: secretKey, // Replace with your actual secret key
    resave: false,
    saveUninitialized: true,
}));


const PORT = 10255;

// Replace with your actual connection string
const mongoURI = process.env.MONGODB_CONNECTION;

const client = new MongoClient(mongoURI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
  });

async function connectToDatabase() {
try {
    await client.connect();
    console.log("Connected successfully to MongoDB");

    const db = client.db('RegisteredUsers');
    // Further database operations

} catch (err) {
    console.error('MongoDB connection error:', err);
}
}

connectToDatabase().catch(console.error);


app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/register', async (req, res) => {
    try {
        const { registerUsername, registerEmail, registerPassword } = req.body;
        const hashedPassword = await bcrypt.hash(registerPassword, 10);
        const userModel = new User(client.db('RegisteredUsers'));
        await userModel.addUser({ username: registerUsername, email: registerEmail, password: hashedPassword });

        // Send a JSON response instead of plain text
        res.json({ success: true, message: 'User registered successfully', username: registerUsername});
    } catch (err) {
        console.error('Error registering new user:', err);

        // Update the error response to JSON as well
        res.status(500).json({ success: false, message: 'Error registering new user' });
    }
});


app.post('/login', async (req, res) => {
    try {
        const { loginEmail, loginPassword } = req.body;
        const userModel = new User(client.db('RegisteredUsers'));
        const user = await userModel.findByEmail(loginEmail);

        if (user && await bcrypt.compare(loginPassword, user.password)) {
            // Store the username in the session
            req.session.username = user.username;
            res.json({ success: true, message: 'Logged in successfully', username: user.username });
        } else {
            res.json({ success: false, message: 'Login failed' });
        }
    } catch (err) {
        res.status(500).send('Error logging in');
    }
});


// Routes for serving static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/loginpage', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'loginpage.html'));
});
app.get('/checkloginstatus', (req, res) => {
    // Check if the user is logged in by looking at the session
    const loggedInUsername = req.session ? req.session.username : null;

    if (loggedInUsername) {
        res.json({ loggedIn: true, username: loggedInUsername });
    } else {
        res.json({ loggedIn: false });
    }
});
app.get('/logout', (req, res) => {
    // Clear the user's session to log them out
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Logout failed');
        } else {
            // Redirect to the homepage or another page after logout
            res.redirect('/');
        }
    });
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

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});

