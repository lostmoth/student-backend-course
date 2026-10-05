const express = require('express');

const app = express();
const port = 3000;

app.use((req, res, next) => {
    console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.url}`
    );

    next();
});

app.get('/', (req, res) => {
    res.send('Привет из бэкенда');
});

app.get('/api/tickets', (req, res) => {
    res.json([
        {
            id: 1,
            event: 'Концерт',
            price: 1500
        },
        {
            id: 2,
            event: 'Футбольный матч',
            price: 2000
        },
        {
            id: 3,
            event: 'Театральная постановка',
            price: 1200
        }
    ]);
});

app.get('/api/events', (req, res) => {
    res.json([
        {
            id: 1,
            name: 'Концерт'
        },
        {
            id: 2,
            name: 'Футбольный матч'
        },
        {
            id: 3,
            name: 'Театральная постановка'
        }
    ]);
});

app.get('/api/tickets/:id', (req, res) => {
    res.json({
        requestedId: req.params.id,
        status: 'success'
    });
});

app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found'
    });
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});