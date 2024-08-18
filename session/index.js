const express = require("express");
const app = express();
const session = require("express-session");

app.use(express.json());
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 60000 },
  })
);

app.get("/test", (req, res) => {
  console.log(req.session);
  req.session.test ? req.session.test++ : (req.session.test = 1);
  res.send(req.session.test.toString());
});

app.get("/check", (req, res) => {
  j;
  console.log(req.session);
  if (req.session.test) {
    res.send("success");
  } else {
    res.send("failure");
  }
});
app.listen("8082", () => {
  console.log("server started");
});
