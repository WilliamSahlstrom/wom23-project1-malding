/* Vi konfigurerar vår express setup här.
Denhär filen kommer att innehålla konfigurationen och setup av vår express applikation */
const express = require('express');
const cors = require('cors');
const app = express();
const userRoutes = require('./routes/userRoutes');
const pokemonsRoutes = require('./routes/pokemonRoutes');
const PORT = process.env.PORT || 3030;

//Middleware
app.use(cors()); //Vi enablerar cors till alla routes
app.use(express.json());

//Define routes here
app.use('/users', userRoutes);

module.exports = app;