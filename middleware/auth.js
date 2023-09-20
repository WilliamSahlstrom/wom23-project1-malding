const jwt = require('jsonwebtoken');
require('dotenv').config(); // läs in alla variabler i .env

module.exports = (req, res, next) => {
    console.log('auth middleware');
    try{
        // plocka ut jwt från headern
        const token = req.headers['authorization'].split(' ')[1];
        // Verifiera token och spara användarinfo
        const authUser = jwt.verify(token, process.env.JWT_SECRET);
        // spara användar info i req
        req.authUser = authUser;

        console.log(authUser);
        next();
    } catch(e) {
        console.log("JWT token is not valid");
        res.status(401).send({message: 'Unauthorized', error: e.message});
    }
}