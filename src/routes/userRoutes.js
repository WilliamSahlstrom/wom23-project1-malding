const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
require('dotenv').config()

//Login 
router.post('/login', async (req, res) => {
    try {
        const user = await prisma.users.findUnique({
            where: {email: req.body.email}
        })

        if (user == null) {
            return res.status(404).send({msg: 'ERROR', error: 'User not found'})
        }

        const match = await bcrypt.compare(req.body.password, user.password)

        if (!match) {
            return res.status(401).send({msg: 'ERROR', error: 'Wrong password'})
        }

        const token = await jwt.sign({ 
            sub: user.id, 
            email: user.email, 
            name: user.name,
            expiresIn: '1d'
        }, process.env.JWT_SECRET)

        res.send({
            token: token, 
            msg: "Login successful", 
            userId: user.id,
            userEmail: user.email
        })

    } catch (error) {
        
    }

})

//Register
router.post('/', async (req, res) => {

    const hash = await bcrypt.hash(req.body.password, 12)

    const user = await prisma.users.create({
        data: {
            email: req.body.email,
            name: req.body.name,
            password: hash
        },
    })
    console.log("user created:", user)
    res.send({ msg: 'user created', id: user.id })
})

module.exports = router;