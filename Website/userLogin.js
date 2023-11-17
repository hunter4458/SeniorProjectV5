console.log('Starting the app');

const express = require('express');
var mongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcryptjs');
const User = require('./user'); 
const app = express();

console.log('Modules loaded');

// Replace with your actual connection string
const dbUrl = "mongodb://seniorprojectv5-server:ao4PLlQMyuC2eQ9nLeq2vGjfcBG8Zg3yc7IacWtQQamtZGk6gu0PcfRLnaOxV2Bwsz3h04UXlyslACDbYjQNjg%3D%3D@seniorprojectv5-server.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@seniorprojectv5-server@";

mongoClient.connect(dbUrl, function (err, client) {
    console.log('Attempting connection');
    if (err) {
        console.error('Failed to connect to MongoDB', err);
        return;
    }

    console.log('Connected to Database');
    const db = client.db('RegisteredUsers'); // replace with your database name
    const userModel = new User(db);

    app.use(express.static('public'));

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

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

    app.use(express.static('public')); // Serve static files from 'public' directory

    const PORT = 10255;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

console.log('MongoDB connect called');
