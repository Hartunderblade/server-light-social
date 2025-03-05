require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;

const pool = require('./db');

const router = express.Router();
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require("./routes/postRoutes");

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use('/auth', authRoutes);
app.use('/users', userRoutes);

app.use('/categories', categoryRoutes);
app.use("/posts", postRoutes);

// app.use('/users', userRoutes);


app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});