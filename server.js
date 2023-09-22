// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const { verifyToken } = require('./middleware/auth');

const app = express();
const port = process.env.PORT || 3030;

app.use(cors());
app.use(express.json());

app.use('/users', userRoutes);

app.use('/auth', authRoutes); // Authentication routes

// Protected route example
/*app.get('/protected', verifyToken, (req, res) => {
    res.json({ message: 'This route is protected.' });
});*/

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
