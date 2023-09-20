const app = require('./app'); //Vi importerar Express appen
const PORT = process.env.PORT || 3030; 

//Define routes and other server setup here

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});