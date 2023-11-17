console.log('Starting the app');

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
var mongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcryptjs');
const User = require('./user');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Replace with your actual connection string
const dbUrl = process.env.MONGODB_CONNECTION;

mongoClient.connect(dbUrl, function (err, client) {
    console.log('Attempting connection');
    if (err) {
        console.error('Failed to connect to MongoDB', err);
        return;
    }

    console.log('Connected to Database');
    const db = client.db('RegisteredUsers'); // replace with your database name
    const userModel = new User(db);

    app.use(express.static(path.join(__dirname, 'public')));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    app.post('/register', async (req, res) => {
        try {
            const { username, email, password } = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);
            await userModel.addUser({ username, email, password: hashedPassword });
            res.status(201).send('User registered successfully');
        } catch (err) {
            console.error('Error registering new user:', err);
            res.status(500).send('Error registering new user');
        }
    });

    app.post('/login', async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await userModel.findByEmail(email);

            if (user && await bcrypt.compare(password, user.password)) {
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
});
