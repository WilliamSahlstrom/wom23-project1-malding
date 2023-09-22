const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Endpoint to get boards for a user
router.get('/boards', verifyToken, async (req, res) => {
    try {
        // Assuming your User model has a relation to Board
        const user = await prisma.user.findUnique({
            where: { id: req.authUser.userId },
            include: { boards: true },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ boards: user.boards });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
