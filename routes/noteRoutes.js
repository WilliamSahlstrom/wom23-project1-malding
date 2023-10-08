const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET all notes from a specific board
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
                color: req.body.color,
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
                color: req.body.color
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
        const noteIdToDelete = req.params.id;
        // Find the note to get associated board ID
        const note = await prisma.note.findUnique({
            where: { id: noteIdToDelete },
            include: { boards: true },
        });

        if (!note) {
            // Handle the case where the note doesn't exist
            throw new Error('Note not found');
        }

        if (note.boards.length === 0) {
            // Handle the case where the note is not associated with any board
            throw new Error('Note is not associated with any board');
        }

        const boardId = note.boards[0].id;

        const board = await prisma.board.findUnique({
            where: {
                id: boardId
            }
        })

        const boardNoteIdsArray = board.noteIds
        const indexToRemove = boardNoteIdsArray.indexOf(noteIdToDelete)
        if (indexToRemove !== -1) boardNoteIdsArray.splice(indexToRemove, 1)
        console.log("New noteIds", boardNoteIdsArray)

        // Remove the note ID from the `noteIds` array in the associated board
        await prisma.board.update({
            where: {
                id: boardId,
            },
            data: {
                notes: {
                    deleteMany: [{ id: noteIdToDelete }],
                },
                noteIds: boardNoteIdsArray,
            },
        });

        // Delete the note
        await prisma.note.delete({
            where: {
                id: noteIdToDelete
            },
        });

        res.send({
            msg: 'Success',
            board: note
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