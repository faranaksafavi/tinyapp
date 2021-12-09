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
function searchDb(key, db) {
  let result = null;
  for (const it in db) {
    if (db[key]["username"] == key) {
      result = it;
      break;
    }
  }
  return result;

}

app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
// dbs
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
const userDb = {
  b2xVn2: {
    username: "fara",
  password: "867"},

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


// render url_index
app.get("/urls", (req, res) => {
  let username = req.cookies["username"];
  let authenticated = false;
  if (req.cookies["username"]) { authenticated = true;}
  const templateVars = { urls: urlDatabase, authenticated :authenticated,username: username};
  res.render("urls_index", templateVars);

});
//redirect /urls_new
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
//render url_show
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
  res.render("urls_show", templateVars);
});
//render url_show
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
//redirect /urls/longurl
app.get("/u/:shortURL", (req, res) => {
  console.log(`:::${req.params.shortURL}`);
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
//redirect /urls
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});
//redirect /urls/shortUrl
app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL]=req.body.edit;
  res.redirect(`/urls/${req.params.shortURL}`);
});
//redirect /urls
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});
//redirect /urls
app.post("/register", (req, res) => {
  let username = req.body["email"].toLowerCase();
  let password = req.body["password"];

  if (!searchDb(username, userDb)) {

    userDb[generateRandomString(8)] = { username, password };
    req.cookies["username"] = username;
    const templateVars = { urls: urlDatabase, authenticated :true,username: username};
    res.render("urls_index",templateVars)
  } else {
    let errors = "this email already exist"
    const templateVars = { urls: urlDatabase, authenticated:false, errors: errors};
    res.render("register",templateVars)
  }
});
app.post("/login", (req, res) => {
  let username = req.body["email"].toLowerCase();
  let password = req.body["password"];

  let user = searchDb(username, userDb);

  if (!user) {
    if (user[password] === password) {
      req.cookies["username"] = username;
      const templateVars = { urls: urlDatabase, authenticated :true,username: username};
      res.render("urls_index",templateVars)
    } else
    {
      let errors = "wrong username or password"
      const templateVars = { urls: urlDatabase, authenticated:false, errors: errors};
      res.render("register",templateVars)

    }
  } else {
    let errors = "this email is not registered"
    const templateVars = { urls: urlDatabase, authenticated:false, errors: errors};
    res.render("register",templateVars)
  }
});
app.get("/register", (req, res) => {

  const templateVars = { urls: urlDatabase};
  res.render("register",templateVars)

});
app.get("/login", (req, res) => {

  const templateVars = { urls: urlDatabase};
  res.render("login",templateVars)

});
app.post("/logout", (req, res) => {

  const templateVars = { urls: urlDatabase};
  res.render("urls_index",templateVars)

});