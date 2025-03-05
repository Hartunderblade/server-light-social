const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Получение данных авторизованного пользователя
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await pool.query("SELECT id, avatar, name, login, email, category FROM users WHERE id = $1", [req.user.id]);
        res.json(user.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Получить данные профиля
router.get('/profile', authMiddleware, async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await pool.query(
            `SELECT u.id, u.name, u.login, u.avatar, ui.categories 
             FROM users u
             JOIN userInfo ui ON u.id = ui.user_id
             WHERE u.id = $1`,
            [userId]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        res.json(user.rows[0]);
    } catch (error) {
        console.error("Ошибка загрузки профиля:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

module.exports = router;
