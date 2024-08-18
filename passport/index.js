const express = require("express");
const app = express();
const mongoose = require("mongoose");
const LocalStrategy = require("passport-local").Strategy;
const { Schema } = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const path = require("path");

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/dcommerce");
  console.log("database connected");
}

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// miidlewares...
app.use(express.json());

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 60000 },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  console.log("Session Data:", req.session);
  next();
});

passport.use(
  new LocalStrategy(
    {
      usernameField: "email", // Assuming the email is used as the username
    },
    async (email, password, done) => {
      try {
        // Find the user by email
        const user = await User.findOne({ email });

        // If user doesn't exist or password doesn't match
        if (!user || user.password !== password) {
          return done(null, false, { message: "Invalid credentials" });
        }

        // Successful authentication
        console.log("successful authentication");
        return done(null, { email: user.email, id: user.id });
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Signup...
app.post("/signup", async (req, res, done) => {
  console.log(req.body);
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      res.status(400).json({ message: "user already exists" });
    } else {
      const newUser = new User(req.body);
      const savedUser = await newUser.save();
      return done(null, savedUser);
    }
  } catch (err) {
    res.status(400).json(err);
  }
});
// Login...
app.post("/login", passport.authenticate("local"), async (req, res) => {
  console.log(req.user);
  console.log(req.session);
  res.json(req.user);
});
// Logout...
app.get("/logout", (req, res) => {
  console.log(req.user);
  console.log(req.session);
  try {
    req.logout();
    res.json({ message: "logged out" });
  } catch (err) {
    res.json(err);
  }
});

// Serialize user for session
passport.serializeUser((user, done) => {
  console.log("serializer", user);
  if (user) {
    return done(null, user.id);
  }
  return done(null, false);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    console.log("deserializer", id);
    const user = await User.findById(id);
    return done(null, user);
  } catch (error) {
    return done(error);
  }
});

const isAuth = (req, res, done) => {
  console.log(req.headers);
  if (req.user) {
    return done();
  }
  res.status(400).json({ message: "not allowed" });
};

app.get("/products", isAuth, (req, res) => {
  console.log(req.headers);
  res.send("products page");
});
app.get("/orders", isAuth, (req, res) => {
  console.log(req.headers);
  res.send("orders page");
});

app.get("/", (req, res) => {
  console.log(req.headers);
  res.sendFile(path.join(__dirname, "/index.html"));
});

app.listen("8081", () => {
  console.log("server started");
});
