const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken')

// GET all boards
router.get('/', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: (req.authUser.sub) }
        })

        const boards = await prisma.board.findMany({
            where: {
                userIds: {
                    hasSome: [req.authUser.sub]
                }
            }
        });

        const token = await jwt.sign({
            sub: user.id,
            email: user.email,
            name: user.name,
            boardIds: user.boardIds
        }, user.secret)

        res.send({
            msg: 'Success',
            boards: boards,
            token: token,
            authorizedUserId: req.authUser.sub
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            msg: 'ERROR',
            error: 'Internal server error'
        });
    }
});

// GET a single board by ID
router.get('/:id', async (req, res) => {
    try {
        const board = await prisma.board.findUnique({
            where: { id: req.params.id }
        });
        if (!board) {
            res.status(404).send({
                msg: 'ERROR',
                error: 'Board not found'
            });
        } else {
            res.send({
                msg: 'Success',
                board: board
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({
            msg: 'ERROR',
            error: 'Internal server error'
        });
    }
});

// Create a new board
router.post('/', async (req, res) => {
    try {
        const board = await prisma.board.create({
            data: {
                name: req.body.name,
                users: {
                    connect: { id: req.authUser.sub },
                }
            }
        });
        res.send({
            msg: 'Success',
            board: board
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            msg: 'ERROR',
            error: 'Internal server error'
        });
    }
});

// Update a board by ID
router.patch('/:id', async (req, res) => {
    try {
        // Check if the user with the provided email exists
        const user = await prisma.user.findUnique({
            where: {
                email: req.body.email,
            },
        });

        if (!user) {
            return res.status(404).send({
                msg: 'ERROR',
                error: 'User not found',
            });
        }

        // Connect the user to the board
        const board = await prisma.board.update({
            where: {
                id: req.params.id,
            },
            data: {
                users: {
                    connect: { id: user.id }
                }
            }
        });
        res.send({
            msg: 'Success',
            board: board
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            msg: 'ERROR',
            error: 'Internal server error'
        });
    }
});

// Delete a board by ID
router.delete('/:id', async (req, res) => {
    try {
        const board = await prisma.board.delete({
            where: {
                id: req.params.id,
            }
        });
        res.send({
            msg: 'Success',
            board: board
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            msg: 'ERROR',
            error: 'Internal server error'
        });
    }
});

module.exports = router;
