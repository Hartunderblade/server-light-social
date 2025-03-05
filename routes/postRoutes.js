const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Создание поста
router.post("/create", authMiddleware, async (req, res) => {
    try {
        const { title, content, image } = req.body;
        const userId = req.user.id;

        const newPost = await pool.query(
            `INSERT INTO posts (user_id, title, content, image, created_at) 
             VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
            [userId, title, content, image]
        );

        res.status(201).json(newPost.rows[0]);
    } catch (error) {
        console.error("Ошибка при создании поста:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Получение всех постов пользователя
router.get("/user", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const posts = await pool.query(
            "SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC",
            [userId]
        );

        res.json(posts.rows);
    } catch (error) {
        console.error("Ошибка при получении постов:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

module.exports = router;
