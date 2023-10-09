const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const { verifyToken } = require('../middleware/auth')
const prisma = new PrismaClient()
require('dotenv').config()

// disable for production?
router.get('/', async (req, res) => {
    const users = await prisma.users.findMany()
    console.log("users GET")
    res.send({
        msg: 'users',
        users: users
    })
})

// restrict for production
router.get('/:id', async (req, res) => {

    const user = await prisma.user.findUnique({
        where: { id: req.params.id }
    })

    console.log("users GET ONE")
    res.send({ msg: 'users', user: user })
})

router.post('/login',async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email: req.body.email }
        })

        if (user == null) {
            return res.status(404).send({ msg: 'ERROR', error: 'User not found' })
        }

        const match = await bcrypt.compare(req.body.password, user.password)

        if (!match) {
            return res.status(401).send({ msg: 'ERROR', error: 'Wrong password' })
        }

        const token = await jwt.sign({
            sub: user.id,
            email: user.email,
            name: user.name,
            boardIds: user.boardIds
        }, process.env.SECRET)

        res.send({
            token: token,
            msg: "Login successful",
            userId: user.id,
            userEmail: user.email
        })

    } catch (error) {
        // Handle other errors, if any
        console.error(error);
        res.status(500).send({ msg: 'ERROR', error: 'Internal server error' });
    }
});

router.post('/', async (req, res) => {

    const hash = await bcrypt.hash(req.body.password, 12)

    const user = await prisma.user.create({
        data: {
            email: req.body.email,
            name: req.body.name,
            password: hash,
            boards: {
                create: {
                    boards: req.body.id
                }
            },
        },
    })
    console.log("user created:", user)
    res.send({ msg: 'user created', id: user.id })
})

router.use(verifyToken)
router.patch('/:id', async (req, res) => {
    try {
        if (req.params.id !== req.authUser.sub) {
            return res.status(403).send({
                msg: 'ERROR',
                error: 'Cannot patch other users'
            });
        }

        let hash = null;  // Change const to let since you want to reassign this variable
        if (req.body.password) {
            hash = await bcrypt.hash(req.body.password, 12);
        }

        const user = await prisma.user.update({
            where: {
                id: req.params.id,
            },
            data: {
                password: hash,
                updatedAt: new Date()
            },
        });

        const token = await jwt.sign({
            sub: user.id,
            email: user.email,
            name: user.name,
            boardIds: user.boardIds
        }, process.env.SECRET)

        return res.send({
            msg: 'patch',
            id: req.params.id,
            user: user,
            token: token
        });
    } catch (error) {
        console.error('Error updating user password:', error);
        return res.status(500).send({
            msg: 'ERROR',
            error: 'Internal Server Error'
        });
    }
});

router.delete('/:id', async (req, res) => {

    try {

        const user = await prisma.users.delete({
            where: {
                id: req.params.id,
            }
        })
        res.send({
            msg: 'deleted',
            id: req.params.id,
            user: user
        })
    } catch (err) {

        console.log(err)
        res.send({
            msg: 'ERROR',
            error: err
        })
    }
})


module.exports = router