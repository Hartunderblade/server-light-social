const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

// Регистрация пользователя
router.post('/register', async (req, res) => {
    const { avatar, name, login, email, password, confirmPassword, category } = req.body;
  
    // Проверяем заполнение полей
    if (!name || !login || !email || !password || !confirmPassword || !category) {
        return res.status(400).json({ message: "Заполните все поля" });
    }
  
    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Пароли не совпадают" });
    }
  
    try {
        // Проверяем существующего пользователя
        const existingUser = await pool.query("SELECT * FROM users WHERE login = $1 OR email = $2", [login, email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "Логин или почта уже заняты" });
        }
  
        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);
  
        // Записываем пользователя в БД
        const newUser = await pool.query(
            "INSERT INTO users (avatar, name, login, email, password, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [avatar, name, login, email, hashedPassword, category]
        );
  
        // Генерируем JWT
        const token = jwt.sign({ id: newUser.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  
        res.json({ token, user: newUser.rows[0] });
  
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
  });
  
// Вход пользователя
router.post('/login', async (req, res) => {
    const { login, password } = req.body;

    if (!login || !password) {
        return res.status(400).json({ message: "Введите логин и пароль" });
    }

    try {
        const userQuery = await pool.query(
            "SELECT * FROM users WHERE login = $1",
            [login]
        );

        if (userQuery.rows.length === 0) {
            return res.status(400).json({ message: "Пользователь не найден" });
        }

        const user = userQuery.rows[0];

        // Проверяем пароль
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: "Неверный пароль" });
        }

        // Генерируем JWT-токен
        const token = jwt.sign(
            { id: user.id, login: user.login },
            "secretkey", // Лучше использовать переменные окружения
            { expiresIn: "24h" }
        );

        res.json({ token, user: { id: user.id, login: user.login } });
    } catch (error) {
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Получение списка категорий при регистрации
router.get('/categories', async (req, res) => {
    try {
        const categories = await pool.query("SELECT * FROM categories");
        res.json(categories.rows);
    } catch (error) {
        res.status(500).json({ message: "Ошибка сервера" });
    }
});


  module.exports = router;