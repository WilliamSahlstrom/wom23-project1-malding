require('dotenv').config();
const cors = require('cors');
const express = require('express');
const userRoutes = require('./routes/userRoutes');
const boardRoutes = require('./routes/boardRoutes');
const noteRoutes = require('./routes/noteRoutes');
const { verifyToken } = require('./middleware/auth'); 

const app = express();
const port = process.env.PORT || 3030;
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    console.log(`GET request to / from ${req.ip}`)
    res.send('Mainpage!')
})


app.use('/public', express.static(__dirname + '/public'))
app.use('/users', userRoutes);
app.use('/boards', verifyToken, boardRoutes); 
app.use('/notes', verifyToken, noteRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/public`);
});