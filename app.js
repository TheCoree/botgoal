const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Подключение к базе данных
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Supertank!23',
    database: 'myapp_db'
});

db.connect(err => {
    if (err) throw err;
    console.log('Подключение к базе данных успешно!');
});

// Главная страница
app.get('/', (req, res) => {
    res.send(`
        <h1>SQL Injection Test</h1>
        <p>Попробуйте выполнить SQL-инъекцию через форму логина</p>
        <form action="/login" method="post">
            <input type="text" name="username" placeholder="Имя пользователя" required>
            <input type="password" name="password" placeholder="Пароль" required>
            <button type="submit">Войти</button>
        </form>
    `);
});

// Уязвимый маршрут логина
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Уязвимый запрос
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

    db.query(query, (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            res.send(`<h1>Добро пожаловать, ${results[0].username}!</h1>`);
        } else {
            res.send('<h1>Неверный логин или пароль</h1>');
        }
    });
});

// Запуск сервера
app.listen(3000, '0.0.0.0', () => {
    console.log('Сервер запущен на http://localhost:3000');
});
