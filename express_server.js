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
function searchDb(value,keyInDb, db) {
  let result = null;
  for (const it in db) {
    console.log(`db[it][keyInDb]: ${db[it][keyInDb]}`)
    if (db[it][keyInDb] == value) {
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
    id :"b2xVn2",
    name: "fara",
    password: "867",
    urls: [],
  },
  b: {
    id: "b",
    name: "pooyan",
    password: "8234",
  urls: []},

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
  let id = req.cookies["id"];
  let authenticated = false;
  let user = null;
  if (req.cookies["id"]) {
    authenticated = true;
    user=searchDb(id,"id", userDb)
  }
  const templateVars = { urls: urlDatabase, authenticated :authenticated,user: user};
  res.render("urls_index", templateVars);

});
//redirect /urls_new
app.get("/urls/new", (req, res) => {
  let id = req.cookies["id"];
  let authenticated = false;
  let user = null;
  if (id) {
    authenticated = true;
    user=searchDb(id,"id", userDb)
    const templateVars = {
      user: user,
      authenticated:authenticated,
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL],
    };
    res.render("urls_new", templateVars);
  }
  else {
    let errors = "First you need to login"
    const templateVars = { urls: urlDatabase , authenticated:false, errors: errors};
    res.status(403).render("login",templateVars)
  }

});
//render url_show
app.get("/urls/:shortURL", (req, res) => {
  let id = req.cookies["id"];
  let authenticated = false;
  let user = null;
  let templateVars;
  if (req.cookies["id"]) {
    authenticated = true;
    user = searchDb(id, "id", userDb)
    if (user["urls"].includes(req.params.shortURL)) {
      templateVars = {
        user: user,
        authenticated: authenticated,
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL],
      };
      res.render("urls_show", templateVars);

    } else {
      templateVars = {
        errors : "this short name is not belong you ,you nead to create a new one",
        user: user,
        authenticated: authenticated,
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL],
      }
      res.render("urls_new", templateVars);
    }
  }
  else {
    templateVars = {
      errors : "First you need to login",
      authenticated: authenticated,
    }
    res.render("login", templateVars);
  }
});
//after creatingrender url_show
app.post("/newUrl", (req, res) => {
  let id = req.cookies["id"];
  let authenticated = false;
  let user = null;
  let templateVars;
  if (req.cookies["id"]) {
    authenticated = true;
    user = searchDb(id, "id", userDb)
     templateVars = {
      shortURL: short,
      longURL: urlDatabase[req.params.shortURL],
      user: user,
      authenticated:authenticated,
    };
    res.render("urls_show", templateVars);
  } else {
    const templateVars = {
      authenticated: authenticated,
      errors : "First you need to login"
    };
    res.render("login", templateVars);
  }
});
//redirect /urls/longurl
app.get("/u/:shortURL", (req, res) => {
  console.log(`:::${req.params.shortURL}`);
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
//redirect /urls
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params["shortURL"];
  let id = req.cookies["id"];
  let authenticated = false;
  let user = null;
  let templateVars;
  if (req.cookies["id"]) {
    authenticated = true;
    user = searchDb(id, "id", userDb)
    if (user["urls"].includes(req.params.shortURL)) {
      delete urlDatabase[req.params["shortURL"]] ;
      res.redirect("/urls");
    } else {
      templateVars = {
        errors : "this short name is not belong you ,you can not delete this",
        user: user,
        authenticated: authenticated,
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL],
      }
      res.render("urls_index", templateVars);
    }
  }
  else {
    templateVars = {
      errors : "First you need to login",
      authenticated: authenticated,
    }
    res.render("login", templateVars);
  }
});
//redirect /urls/shortUrl
app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL]=req.body.edit;
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post("/login", (req, res) => {
  let user = searchDb(lowercase(req.body["email"]), "name", userDb)
  if (user) {
    if (user["password"]===req.body["password"]) {
      req.cookies["id"] = user["id"];
      const templateVars = {
        urls: urlDatabase, authenticated: true, user: user
      };
      res.render("urls_index", templateVars);
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
    const templateVars = { urls: urlDatabase, authenticated:false, errors: errors};
    res.render("login", templateVars);
  }
});

app.get("/login", (req, res) => {

  const templateVars = { urls: urlDatabase , authenticated:false, errors: ""};
  res.status(403).render("login",templateVars)

});
app.get("/logout", (req, res) => {
  res.clearCookie("id");
  const templateVars = { urls: urlDatabase, authenticated : false };
  res.status(200).render("urls_index",templateVars)
});
//redirect /urls
app.post("/register", (req, res) => {

  let name =lowercase(req.body.email) ;
  let password = req.body["password"];
  let user =searchDb(user,"name", userDb)
  if (!user) {
    id = generateRandomString(8);
    userDb[id] = {id ,name, password };
    req.cookies["id"] = id;
    const templateVars = { urls: urlDatabase, authenticated: true, user: user };
    res.render("urls_index",templateVars)
  } else {
    let errors = "this email already exist"
    const templateVars = { urls: urlDatabase, authenticated:false, errors: errors};
    res.render("register", templateVars)
  }
});
app.get("/register", (req, res) => {
  let errors = "";
  const templateVars = { urls: urlDatabase, authenticated :false, errors: errors };
  res.render("register",templateVars)

});
app.get("/urls/:user['name']", (req, res) => {
  const id= urlDatabase[req.params.id];
  let user = searchDb(req.params["id"], "id", userDb);
  let errors = "";
  let database = {};
  if (user["urls"]) {
    user["urls"].forEach((url) => { database[url] = urlDatabase[url] });
  }
  const templateVars = { urls: database, authenticated :false, errors: errors ,user:user};
  res.render("myUrls",templateVars)
});