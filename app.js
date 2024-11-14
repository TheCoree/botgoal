const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Настройка сессий
app.use(
    session({
        secret: 'secret',
        resave: false,
        saveUninitialized: true
    })
);

// Настройка подключения к базе данных
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'your_password',
    database: 'myapp_db'
});

db.connect(err => {
    if (err) throw err;
    console.log('Подключение к базе данных успешно!');
});

// Маршрут для главной страницы
app.get('/', (req, res) => {
    res.send('<h1>Добро пожаловать!</h1><a href="/login">Войти</a> | <a href="/register">Регистрация</a>');
});

// Маршрут для формы регистрации
app.get('/register', (req, res) => {
    res.send(`
        <h1>Регистрация</h1>
        <form action="/register" method="post">
            <input type="text" name="username" placeholder="Имя пользователя" required>
            <input type="password" name="password" placeholder="Пароль" required>
            <button type="submit">Зарегистрироваться</button>
        </form>
    `);
});

// Обработка регистрации
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err, results) => {
        if (err) throw err;
        res.send('<h2>Регистрация успешна!</h2><a href="/login">Перейти к логину</a>');
    });
});

// Маршрут для формы логина
app.get('/login', (req, res) => {
    res.send(`
        <h1>Вход</h1>
        <form action="/login" method="post">
            <input type="text" name="username" placeholder="Имя пользователя" required>
            <input type="password" name="password" placeholder="Пароль" required>
            <button type="submit">Войти</button>
        </form>
    `);
});

// Обработка логина
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            const user = results[0];
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                req.session.user = user;
                res.send('<h2>Вход успешен!</h2><a href="/profile">Перейти к профилю</a>');
            } else {
                res.send('<h2>Неверный пароль</h2><a href="/login">Попробовать снова</a>');
            }
        } else {
            res.send('<h2>Пользователь не найден</h2><a href="/register">Зарегистрироваться</a>');
        }
    });
});

// Маршрут для профиля
app.get('/profile', (req, res) => {
    if (req.session.user) {
        res.send(`<h1>Привет, ${req.session.user.username}!</h1><a href="/logout">Выйти</a>`);
    } else {
        res.redirect('/login');
    }
});

// Маршрут для выхода
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Запуск сервера
app.listen(3000, '0.0.0.0', () => {
    console.log('Сервер запущен на http://0.0.0.0');
});
