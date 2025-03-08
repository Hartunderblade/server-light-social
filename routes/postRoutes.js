const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Создание поста с категорией
router.post("/create", authMiddleware, async (req, res) => {
    try {
        const { title, content, image, category_id } = req.body; // Добавил category_id
        const userId = req.user.id;

        // Получаем name и avatar пользователя
        const user = await pool.query("SELECT name, avatar FROM users WHERE id = $1", [userId]);
        if (user.rows.length === 0) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }
        const { name, avatar } = user.rows[0];

        const newPost = await pool.query(
            `INSERT INTO posts (user_id, title, content, image, category_id, created_at) 
             VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
            [userId, title, content, image, category_id]
        );

        // Возвращаем пост вместе с именем и аватаром
        res.status(201).json({
            ...newPost.rows[0],
            name,
            avatar,
        });
    } catch (error) {
        console.error("Ошибка при создании поста:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Получение всех постов пользователя с категориями
router.get("/user", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const posts = await pool.query(
            `SELECT posts.*, users.name, users.avatar, categories.name AS category_name
             FROM posts
             JOIN users ON posts.user_id = users.id
             LEFT JOIN categories ON posts.category_id = categories.id
             WHERE posts.user_id = $1 
             ORDER BY posts.created_at DESC`,
            [userId]
        );

        res.json(posts.rows);
    } catch (error) {
        console.error("Ошибка при получении постов:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Получение всех категорий (для выбора при создании поста)
router.get("/categories", async (req, res) => {
    try {
        const categories = await pool.query("SELECT * FROM categories");
        res.json(categories.rows);
    } catch (error) {
        console.error("Ошибка при получении категорий:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

module.exports = router;
