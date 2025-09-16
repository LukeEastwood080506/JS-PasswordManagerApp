require("dotenv").config({ path: "../../.env" }); // Load env vars from project root

// Imports express.
const express = require("express");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
// Imports CORS which allows resources to be shared across different servers.
const cors = require("cors");
const app = express();
const host = process.env.HOST || "127.0.0.1";
const port = process.env.PORT || 6969;
const sessionSecret = process.env.SESSION_SECRET || "garkyspasswordmanager";

app.use(cors({
  origin: "http://127.0.0.1:8080", // Frontend origin
  credentials: true, // Allows for cookies/sessions.
}));

// Gives access to the static files in the page directory.
app.use(express.static("pages"));

// Applies middleware.
app.use(express.json());

// Applies session middleware.
app.use(
  session({
    store: new SQLiteStore({ db: "sessions.sqlite", dir: "./sessions" }), // sqlite session store.
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // prevents JS from reading cookies
      secure: false, // set to true if using HTTPS.
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// Test route
app.get("/", (request, response) => {
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
const notificationsRoute = require("./routes/notifications");
app.use("/notifications", notificationsRoute);
const generatorRoute = require("./routes/generator");
app.use("/generator", generatorRoute);

app.listen(port, host, () => {
  console.log("Password Manager Backend Operational!");
});
