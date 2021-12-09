const express = require("express");
var cookieParser = require('cookie-parser')
const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080
function lowercase(st) {
  let result=""
  st.split("").forEach((char) => { ((/[A-Z]/).test(char)) ? result += char.toLowerCase() : result += char; });
  return result;
};
function searchDb(key, db) {
  let result = null;
  for (const it in db) {
    console.log(`db[it]["username"]: ${db[it]["username"]}`)
    if (db[it]["username"] == key) {
      result = db[it];

      break;
    }
  }
  console.log(`search result: ${result}`)
  return result;

}
function generateRandomString(len) {
  let str = "";
  for (let i = 0; i < len; i++) {
    str += String.fromCharCode((Math.floor(Math.random() * 100) % 26) + 97);
  }
  return str;
}
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
const userDb = {
  b2xVn2: {
    a: "fara",
  password: "867"},
  b: {
    username: "pooyan",
  password: "8234"},

};


app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
// dbs


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

app.post("/login", (req, res) => {
  console.log("i am in login state")
  let email = req.body["email"];
  let username  =lowercase(email);
  let pass = req.body["password"];
  let user = searchDb(username, userDb);
  if (user) {
   console.log(`user : ${Object.keys(user) }`)
    console.log(`pass : ${pass}`);
    let realPass = user["password"];
    let logic = realPass === pass;
    console.log(`logic: ${logic}`)
    if (logic) {
      req.cookies["username"] = username;
      const templateVars = { urls: urlDatabase, authenticated: true, username: username };
      console.log(`register username :${username}`);
      res.render("urls_index",templateVars)
    }
    else{
      let errors = "wrong username or password"
      console.log(errors )
      const templateVars = { urls: urlDatabase, authenticated:false, errors: errors};
      res.render("login",templateVars)
    }
  }
  else
  {
    let errors = "this email is not registered "
    console.log(errors )
    const templateVars = { urls: urlDatabase, authenticated:false, errors: errors};
    res.render("login", templateVars);
  }
});

app.get("/login", (req, res) => {

  const templateVars = { urls: urlDatabase , authenticated:false, errors: ""};
  res.status(403).render("login",templateVars)

});
app.get("/logout", (req, res) => {
  res.clearCookie("username");
  const templateVars = { urls: urlDatabase, authenticated : false };
  res.status(200).render("urls_index",templateVars)
});
//redirect /urls
app.post("/register", (req, res) => {
  let email = req.body.email;
  let username =lowercase(email) ;
  let password = req.body["password"];
  let user =searchDb(username, userDb)
  console.log(`user :${user}`);
  if (!user) {
    userDb[generateRandomString(8)] = { username, password };
    req.cookies["username"] = username;
    const templateVars = { urls: urlDatabase, authenticated: true, username: username };
    console.log(`there is no ${username} ok to go`);
    res.render("urls_index",templateVars)
  } else {
    let errors = "this email already exist"
    const templateVars = { urls: urlDatabase, authenticated:false, errors: errors};
    console.log(`error :${errors}`);
    res.render("register", templateVars)
  }
});
app.get("/register", (req, res) => {
  let errors = "";

  const templateVars = { urls: urlDatabase, authenticated :false, errors: errors };
  res.render("register",templateVars)

});