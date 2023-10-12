const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 80;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api', (req, res) => {
    console.log(process.env.OPENAI_API_KEY);
    res.send('My api key is: ' + process.env.OPENAI_API_KEY);
});

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});