const express = require("express");
const app = express();
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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});
app.post("/urls", (req, res) => {
  let short = generateRandomString(6);
  urlDatabase[short] = req.body["longURL"];
  console.log(req.body); // Log the POST request body to the console
  const templateVars = {
    shortURL: short,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});
app.get("/u/:shortURL", (req, res) => {
  console.log(`:::${req.params.shortURL}`);
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  console.log(req.body); // Log the POST request body to the console

  res.redirect("/urls");
  //res.send("Ok"); // Respond with 'Ok' (we will replace this)
});
app.post("/urls/:shortURL/edit", (req, res) => {

  const longUrl = urlDatabase[req.params.shortURL];
  console.log(`long: ${longUrl}`); // Log the POST request body to the
  urlDatabase[req.params.shortURL]=req.body.edit;
  console.log(`db: ${Object.values(urlDatabase)}`); // Log

  //res.send("Ok"); // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/${req.params.shortURL}`);
});