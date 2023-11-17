console.log('Starting the app');

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const {MongoClient} = require('mongodb');
const bcrypt = require('bcryptjs');
const User = require('./user');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

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
        res.status(201).send('User registered successfully');
    } catch (err) {
        console.error('Error registering new user:', err);
        res.status(500).send('Error registering new user');
    }
});

app.post('/login', async (req, res) => {
    try {
        const { loginEmail, loginPassword } = req.body;
        const userModel = new User(client.db('RegisteredUsers'));
        const user = await userModel.findByEmail(loginEmail);

        if (user && await bcrypt.compare(loginPassword, user.password)) {
            res.send('Logged in successfully');
        } else {
            res.status(401).send('Login failed');
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

