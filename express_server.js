const express = require("express");
var cookieParser = require('cookie-parser')
const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080

function generateRandomString(len) {
  let str = "";
  for (let i = 0; i < len; i++) {
    str += String.fromCharCode((Math.floor(Math.random() * 100) % 26) + 97);
  }
  return str;
}

app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});
app.get("/urls", (req, res) => {
  let username = req.cookies["username"];
  let authenticated = false;
  if (req.cookies["username"]) { authenticated = true;}
  const templateVars = { urls: urlDatabase, authenticated :authenticated,username: username};
  res.render("urls_index", templateVars);
  console.log(`url :${username}`);
});
app.get("/urls/new", (req, res) => {
  let username = req.cookies["username"];
  let authenticated = false;
  if (req.cookies["username"]) { authenticated = true;}
  const templateVars = {
    username: username,
    authenticated:authenticated,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_new", templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  let username = req.cookies["username"];
  let authenticated = false;
  if (req.cookies["username"]) { authenticated = true;}
  const templateVars = {
    username: username,
    authenticated:authenticated,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  console.log(`get show_me username :${username}`);
  res.render("urls_show", templateVars);
});
app.post("/urls", (req, res) => {
  let username = req.cookies["username"];
  let authenticated = false;
  if (req.cookies["username"]) { authenticated = true;}
  let short = generateRandomString(6);
  urlDatabase[short] = req.body["longURL"];
  const templateVars = {
    shortURL: short,
    longURL: urlDatabase[req.params.shortURL],
    username: username,
    authenticated:authenticated,
  };
  console.log(`post new username :${username}`);
  res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  console.log(`:::${req.params.shortURL}`);
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});
app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL]=req.body.edit;
  res.redirect(`/urls/${req.params.shortURL}`);
});
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
 // console.log(`login: ${req.body}`);
 // console.log(`coockies: ${JSON.stringify(req.cookies)}`);
  //res.send("Ok"); // Respond with 'Ok' (we will replace this)
  let authenticated = false;
  if (req.cookies["username"]){ authenticated = true;}

  res.redirect("/urls");
});