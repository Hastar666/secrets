require("dotenv").config();
const express = require("express");
const bodyparser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app = express();
const encrypt = require("mongoose-encryption");
app.use(express.static("public"));
mongoose.connect("mongodb://127.0.0.1:27017/userDB");
app.set("view engine", "ejs");
app.use(
  bodyparser.urlencoded({
    extended: true,
  })
);
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ["password"],
});

const User = new mongoose.model("User", userSchema);
app.get("/", (req, res) => {
  res.render("home.ejs");
});
app.get("/login", (req, res) => {
  res.render("login.ejs");
});
app.get("/register", (req, res) => {
  res.render("register.ejs");
});
// Assuming you have your User model defined as before

app.post("/register", async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (!username || !password) {
      // Handle the case where one or both fields are missing
      res.status(400).send("Both username and password are required");
      return;
    }

    const newUser = new User({
      username: username,
      password: password,
    });

    await newUser.save();

    // Render the 'secrets' page when both username and password are provided
    res.render("secrets");
  } catch (error) {
    console.error(error);
    // Handle the error as needed, e.g., render an error page or send an error response
  }
});
app.post("/login", async (req, res) => {
  let userFound = false; // Use a single variable to track if the user is found

  const userName = req.body.username;
  const password = req.body.password;

  try {
    const user = await User.findOne({ username: userName }).exec();

    if (user) {
      // Decrypt the password stored in the database
      const decryptedPassword = user.password;

      if (password === decryptedPassword) {
        res.render("secrets.ejs");
      } else {
        res.status(400).send("Invalid credentials");
      }
    } else {
      res.status(400).send("User not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(3000, function () {
  console.log("server running on port 3000");
});
