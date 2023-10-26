const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require('dotenv').config();

/**
 * Retrieve all users. (Disabled for production)
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
router.get('/', async (req, res) => {
    const users = await prisma.users.findMany();
    console.log("users GET");
    res.send({ 
        msg: 'users', 
        users: users
    });
});

/**
 * Retrieve a single user by ID. (Restricted for production)
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
router.get('/:id', async (req, res) => {
    const user = await prisma.user.findUnique({
        where: {id: req.params.id}
    });

    console.log("users GET ONE");
    res.send({ msg: 'users', user: user });
});

/**
 * Authenticate a user during login.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
router.post('/login', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email: req.body.email }
        });

        if (user == null) {
            return res.status(404).send({ msg: 'ERROR', error: 'User not found' });
        }
        if (user.name === null) {
            // Handle the case where the "name" is null
            return res.status(500).json({ message: 'User data is incomplete' });
        }

        const match = await bcrypt.compare(req.body.password, user.password);

        if (!match) {
            return res.status(401).send({ msg: 'ERROR', error: 'Wrong password' });
        }

        const token = await jwt.sign({ 
            sub: user.id, 
            email: user.email, 
            name: user.name,
            boardIds: user.boardIds
        }, process.env.JWT_SECRET);

        res.send({
            token: token, 
            msg: "Login successful", 
            userId: user.id,
            userEmail: user.email
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({ msg: 'ERROR', error: 'Internal server error' });
    }
});

/**
 * Create a new user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
router.post('/', async (req, res) => {
    const hash = await bcrypt.hash(req.body.password, 12);
    const user = await prisma.user.create({
        data: {
            email: req.body.email,
            name: req.body.name,
            password: hash,
            boards: {
                create: {
                    boards: req.body.id
                }
            }
        },
    });
    console.log("user created:", user);
    res.send({ msg: 'user created', id: user.id });
});

/**
 * Update a user by ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
router.patch('/:id', async (req, res) => {
    if (req.params.id != req.authUser.sub) {
        res.status(403).send({
            msg: 'ERROR',
            error: 'Cannot patch other users'
        });
    }

    let hash = null;
    if (req.body.password) {
        hash = await bcrypt.hash(req.body.password, 12);
    }

    const user = await prisma.users.update({
        where: {
            id: req.params.id,
        },
        data: {
            password: hash,
            name: req.params.name,
            updatedAt: new Date()
        },
    });
    res.send({
        msg: 'patch',
        id: req.params.id,
        user: user
    });
});

/**
 * Delete a user by ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
router.delete('/:id', async (req, res) => {
    try {
        const user = await prisma.users.delete({
            where: {
                id: req.params.id,
            }
        });
        res.send({
            msg: 'deleted',
            id: req.params.id,
            user: user
        });
    } catch (err) {
        console.log(err);
        res.send({
            msg: 'ERROR',
            error: err
        });
    }
});

module.exports = router;
