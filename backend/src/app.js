// Imports express.
const express = require("express");
const app = express();
const port = 6969;

// Applies middleware.
app.use(express.json());

// Test route
app.get('/', (request, response) =>{
    response.send("Password Manager Backend Running");
});

// Import routes
const userRoute = require('./routes/user');
app.use('/user', userRoute);
const passwordRoute = require('./routes/password');
app.use('/password', passwordRoute);

app.listen(port, () =>{
   console.log("Password Manager API is live at http://localhost:" + port); 
});
