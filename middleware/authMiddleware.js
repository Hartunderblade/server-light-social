const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Нет доступа" });
    }

    try {
        const decoded = jwt.verify(token, "secretkey"); // Используем тот же ключ
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Неверный токен" });
    }
};

// module.exports = (req, res, next) => {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//         return res.status(401).json({ message: "Нет авторизации" });
//     }

//     const token = authHeader.split(' ')[1]; // Берём сам токен без "Bearer"
//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decoded; // Сохраняем id пользователя
//         console.log("Авторизованный пользователь:", req.user);
//         next();
//     } catch (error) {
//         return res.status(401).json({ message: "Неверный или просроченный токен" });
//     }
// };
