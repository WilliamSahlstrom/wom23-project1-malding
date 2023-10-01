require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const boardRoutes = require('./routes/boardRoutes');
const { verifyToken } = require('./middleware/auth'); 

const app = express();
const port = process.env.PORT || 3030;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/public', express.static(__dirname + '/public'))

app.use('/users', userRoutes);
app.use('/boards', verifyToken, boardRoutes); 

app.listen(port, () => {
    console.log(`Server is running on port ${port}/public`);
});
