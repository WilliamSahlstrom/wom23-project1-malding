// Load environment variables from the .env file
require('dotenv').config();

// Import required modules
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const boardRoutes = require('./routes/boardRoutes');
const { verifyToken } = require('./middleware/auth');

// Initialize the Express application
const app = express();
const port = process.env.PORT || 3030;

/**
 * Middleware setup to enable necessary features and logging.
 */
app.use(cors()); // Enable cross-origin resource sharing
app.use(express.json()); // Parse incoming requests with JSON payloads
app.use(morgan('dev')); // Log HTTP requests to the console

/**
 * Define a GET route for the main page.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get('/', (req, res) => {
    console.log(`GET request to / from ${req.ip}`);
    res.send('Mainpage!');
});

/**
 * Serve static files from the 'public' directory.
 */
app.use('/public', express.static(__dirname + '/public'));

/**
 * Define routes for user and board operations.
 */
app.use('/users', userRoutes); // User-related routes
app.use('/boards', verifyToken, boardRoutes); // Board-related routes requiring authentication

/**
 * Start the server and listen on the specified port.
 */
app.listen(port, () => {
    console.log(`Server is running on port ${port}/public`);
});

module.exports = app; // Export the Express application for testing or integration purposes
