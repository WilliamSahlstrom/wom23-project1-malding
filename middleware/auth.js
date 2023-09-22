const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    console.log('auth middleware');
    try {
        // Check if the Authorization header is present
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new Error('Missing Authorization header');
        }

        // Check if the Authorization header has the expected format
        const tokenParts = authHeader.split(' ');
        if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
            throw new Error('Invalid Authorization header format');
        }

        // Extract the token from the header
        const token = tokenParts[1];

        // Verify the token and extract user information
        const authUser = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user information to the request object
        req.authUser = authUser;

        console.log(authUser);
        next();
    } catch (error) {
        console.error("JWT token validation error:", error.message);
        res.status(401).json({ message: 'Unauthorized', error: error.message });
    }
};

module.exports = { verifyToken };
