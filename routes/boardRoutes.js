const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Retrieve all boards associated with the authenticated user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
router.get('/', async (req, res) => {
    try {
        const boards = await prisma.board.findMany({
            where: {
                userIds: {
                    hasSome: [req.authUser.sub]
                }
            }
        });
        res.send({
            msg: 'Success',
            boards: boards,
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

/**
 * Retrieve a single board by its ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
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

/**
 * Create a new board.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
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

/**
 * Update a board by its ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
router.patch('/:id', async (req, res) => {
    try {
        const board = await prisma.board.update({
            where: {
                id: req.params.id,
            },
            data: {
                name: req.body.name,
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

/**
 * Delete a board by its ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
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
