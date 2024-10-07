const express = require('express');
const path = require('path');
const app = express();

const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};


app.use(express.static(path.join(__dirname, 'public')));
app.get('/', async(req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/stream', async (_req, res) => {
    res.setHeader('Content-Type', 'application/stream+json');

    const text = "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of de Finibus Bonorum et Malorum (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, Lorem ipsum dolor sit amet.., comes from a line in section 1.10.32.";
    const array = text.split(" ");
    for (let i = 0; i < array.length; i++) {
        res.write(`${array[i]} `);
        await sleep(100); // Simulates a delay
    }
    res.end();
});

const port = 8080;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});