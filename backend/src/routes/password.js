const express = require("express");
const router = express.Router();

// GET, POST, PUT, DELETE requests etc.
router.get("/", (request, response) =>{
    response.send({
        "message": "Password Route Working"
    });
});

// Export values and functions from the router object.
module.exports = router;