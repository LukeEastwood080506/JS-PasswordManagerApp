// Imports express.
const express = require("express");
// Imports CORS which allows resources to be shared across different servers.
const cors = require("cors");
const app = express();
const port = 6969;

app.use(cors());
// Gives access to the static files in the page directory.
app.use(express.static("pages"));

// Applies middleware.
app.use(express.json());

// Test route
app.get("/", (request, response) => {
  console.log("GET request to ", request.url);
  response.json({
    message: "Password Manager Backend Operational!",
  });
});

// Import routes
const userRoute = require("./routes/users");
app.use("/users", userRoute);
const passwordRoute = require("./routes/passwords");
app.use("/passwords", passwordRoute);
const deletedPasswordRoute = require("./routes/deletedPasswords");
app.use("/deletedPasswords", deletedPasswordRoute);

app.listen(port, () => {
  console.log("Password Manager Backend Operational!");
});
