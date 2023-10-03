const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET all notes
router.get('/:id', async (req, res) => {
    try {
        const note = await prisma.note.findMany({
            where: {
                boardIds: {
                    hasSome: [req.params.id]
                }
            },
        });
        res.send({
            msg: 'Success',
            notes: note
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            msg: 'ERROR',
            error: 'Internal server error'
        });
    }
});

// Create a new note on a specific board with boardId
router.post('/:id', async (req, res) => {
    try {
        const note = await prisma.note.create({
            data: {
                text: req.body.text,
                boards: {
                    connect: { id: req.params.id }, 
                }
            }
        });
        res.send({
            msg: 'Success',
            note: note
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            msg: 'ERROR',
            error: 'Internal server error'
        });
    }
});

// Update a note by ID
router.patch('/:id', async (req, res) => {
    try {
        const note = await prisma.note.update({
            where: {
                id: req.params.id,
            },
            data: {
                text: req.body.text,
            }
        });
        res.send({
            msg: 'Success',
            note: note
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            msg: 'ERROR',
            error: 'Internal server error'
        });
    }
});

// Delete a note by ID
router.delete('/:id', async (req, res) => {
    try {
        const note = await prisma.note.delete({
            where: {
                id: req.params.id,
            }
        });
        res.send({
            msg: 'Success',
            note: note
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