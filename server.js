require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const boardRoutes = require('./routes/boardRoutes'); // Include board routes
const { verifyToken } = require('./middleware/auth'); // Corrected import path

const app = express();
const port = process.env.PORT || 3030;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/users', userRoutes);
app.use('/auth', authRoutes); // Authentication routes
app.use('/boards', verifyToken, boardRoutes); // Include board routes

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
