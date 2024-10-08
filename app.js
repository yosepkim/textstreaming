const express = require('express');
const fs = require('fs');
const path = require('path');
const https = require('https');
const app = express();

var privateKey  = fs.readFileSync('/etc/letsencrypt/live/edgecloud9.com/privkey.pem', 'utf8');
var certificate = fs.readFileSync('/etc/letsencrypt/live/edgecloud9.com/fullchain.pem', 'utf8');

var credentials = {key: privateKey, cert: certificate};

const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};


app.use(express.static(path.join(__dirname, 'public')));
app.get('/', async(req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/stream', async (_req, res) => {
    res.setHeader('Content-Type', 'application/stream+json');

const text = "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.";
    const array = text.split(" ");
    for (let i = 0; i < array.length; i++) {
        res.write(`${array[i]} `);
        await sleep(200); // Simulates a delay
    }
    res.end();
});

const httpsServer = https.createServer(credentials, app);
httpsServer.listen(443);