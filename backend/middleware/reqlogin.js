const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

module.exports = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ error: "You must be logged in" });
    }

    const token = authorization.replace("Bearer ", "");

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const { id } = payload;
        
        const user = await User.findById(id).select("-password");
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }
        
        req.user = user;
        next();

    } catch (err) {
        return res.status(401).json({ error: "You must be logged in" });
    }
};