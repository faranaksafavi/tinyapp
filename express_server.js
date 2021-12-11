const express = require("express");
var cookieParser = require("cookie-session");
const bcrypt = require("bcryptjs");
const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080
class renderHelp {
  constructor({
    id,
    key,
    db,
    msgOk,
    msgNo,
    renderOk,
    renderNo,
    user,
    func,
    result,
    authenticated,
  }) {
    this.keys = [
      "msgOk",
      "id",
      "msgNo",
      "renderOk",
      "renderNo",
      "user ",
      "authenticated",
      "db",
      "resultDb",
      "key",
      "func",
    ];
    let argKeys = Object.keys(myArgs);
    for (let i = 0; i < 7; i++) {
      if (argKeys.includes(keys[i])) {
        this[keys[i]] = myArgs[keys[i]];
      } else {
        this[keys[i]] = "";
      }
    }
    for (let i = 7; i < 9; i++) {
      let argKeys = Object.keys(myArgs);
      if (argKeys.includes(keys[i])) {
        this[keys[i]] = myArgs[keys[i]];
      } else {
        this[keys[i]] = {};
      }
    }
    if (argKeys.includes("key")) {
      this.key = myArgs["key"];
    } else {
      this.key = "id";
    }
    if (argKeys.includes("func")) {
      this.func = myArgs["func"];
    } else {
      this.func = searchDb;
    }
  }
  result() {
    if (id) {
      authenticated = true;
      user = func(id, key, db);
      user["urls"].forEach((it) => {
        let key = db[it][shortURL];
        let value = db[it][longURL];
        resultDb[key] = value;
      });
      result = {
        user,
        authenticated,
        msgOk,
        resultDb,
      };
      res.render(renderOk, result);
    } else {
      res.render(renderNo, result);
    }
  }
}
function lowercase(st) {
  let result = "";
  st.split("").forEach((char) => {
    /[A-Z]/.test(char) ? (result += char.toLowerCase()) : (result += char);
  });
  return result;
}
function searchDb(value, keyInDb, db) {
  let result = null;
  for (const it in db) {
    if (db[it][keyInDb] == value) {
      result = db[it];
      break;
    }
  }
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
  b2xVn2: {
    id: b2xVn2,
    longURL: "http://www.lighthouselabs.ca",
    use_id: "b2xVn2",
  },
};
const userDb = {
  b2xVn2: {
    id: "b2xVn2",
    name: "fara",
    hashedPassword: bcrypt.hashSync(""),
  },
  b: {
    id: "b",
    name: "pooyan",
    phashedPassword: "8234",
  },
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
  let id = req.session["id"];
  let authenticated = false;
  let user = null;
  let database = {};
  if (id) {
    authenticated = true;
    user = searchDb(id, "id", userDb);
    user["urls"].forEach((it) => {
      let key = database[it][shortURL];
      let value = database[it][longURL];
      database[key] = value;
    });
  }
  const templateVars = { database, authenticated, user };
  res.render("urls_index", templateVars);
});
//redirect /urls_new
app.get("/urls/new", (req, res) => {
  let id = req.session["id"];
  let authenticated = false;
  let user = null;
  if (id) {
    authenticated = true;
    user = searchDb(id, "id", userDb);
    const templateVars = {
      user: user,
      authenticated: authenticated,
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL],
    };
    res.render("urls_new", templateVars);
  } else {
    let errors = "First you need to login";
    const templateVars = {
      urls: urlDatabase,
      authenticated: false,
      errors: errors,
    };
    res.render("login", templateVars);
  }
});
//render url_show
app.get("/urls/:shortURL", (req, res) => {
  let id = req.session["id"];
  let authenticated = false;
  let user = null;
  let templateVars;
  if (req.session["id"]) {
    authenticated = true;
    user = searchDb(id, "id", userDb);
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
        errors:
          "this short name is not belong you ,you nead to create a new one",
        user: user,
        authenticated: authenticated,
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL],
      };
      res.render("urls_new", templateVars);
    }
  } else {
    templateVars = {
      errors: "First you need to login",
      authenticated: authenticated,
    };
    res.render("login", templateVars);
  }
});
//after creatingrender url_show
app.post("/newUrl", (req, res) => {
  let id = req.session["id"];
  let authenticated = false;
  let user = null;
  let templateVars;
  if (req.session["id"]) {
    authenticated = true;
    user = searchDb(id, "id", userDb);
    templateVars = {
      shortURL: short,
      longURL: urlDatabase[req.params.shortURL],
      user: user,
      authenticated: authenticated,
    };
    res.render("urls_show", templateVars);
  } else {
    const templateVars = {
      authenticated: authenticated,
      errors: "First you need to login",
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
  let id = req.session["id"];
  let authenticated = false;
  let user = null;
  let templateVars;
  if (req.session["id"]) {
    authenticated = true;
    user = searchDb(id, "id", userDb);
    if (user["urls"].includes(req.params.shortURL)) {
      delete urlDatabase[req.params["shortURL"]];
      res.redirect("/urls");
    } else {
      templateVars = {
        errors: "this short name is not belong you ,you can not delete this",
        user: user,
        authenticated: authenticated,
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL],
      };
      res.render("urls_index", templateVars);
    }
  } else {
    templateVars = {
      errors: "First you need to login",
      authenticated: authenticated,
    };
    res.render("login", templateVars);
  }
});
//redirect /urls/shortUrl
app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.edit;
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post("/login", (req, res) => {
  let user = searchDb(lowercase(req.body["email"]), "name", userDb);
  bcrypt.compareSync(req.body["password"], hashedPassword);
  if (user) {
    if (bcrypt.compareSync(req.body["password"], hashedPassword)) {
      req.session["id"] = user["id"];
      const templateVars = {
        urls: urlDatabase,
        authenticated: true,
        user: user,
      };
      res.render("urls_index", templateVars);
    } else {
      let errors = "wrong username or password";
      console.log(errors);
      const templateVars = {
        urls: urlDatabase,
        authenticated: false,
        errors: errors,
      };
      res.render("login", templateVars);
    }
  } else {
    let errors = "this email is not registered ";
    const templateVars = {
      urls: urlDatabase,
      authenticated: false,
      errors: errors,
    };
    res.render("login", templateVars);
  }
});

app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, authenticated: false, errors: "" };
  res.status(403).render("login", templateVars);
});
app.get("/logout", (req, res) => {
  res.clearCookie("id");
  const templateVars = { urls: urlDatabase, authenticated: false };
  res.status(200).render("urls_index", templateVars);
});
//redirect /urls
app.post("/register", (req, res) => {
  let name = lowercase(req.body.email);
  let password = req.body["password"];
  const hashedPassword = bcrypt.hashSync(password, 10);
  let user = searchDb(user, "name", userDb);
  if (!user) {
    id = generateRandomString(8);
    userDb[id] = { id, name, hashedPassword };
    req.session["id"] = id;
    const templateVars = { urls: urlDatabase, authenticated: true, user: user };
    res.render("urls_index", templateVars);
  } else {
    let errors = "this email already exist";
    const templateVars = {
      urls: urlDatabase,
      authenticated: false,
      errors: errors,
    };
    res.render("register", templateVars);
  }
});
app.get("/register", (req, res) => {
  let errors = "";
  const templateVars = {
    urls: urlDatabase,
    authenticated: false,
    errors: errors,
  };
  res.render("register", templateVars);
});
app.get("/urls/:user['name']", (req, res) => {
  const id = urlDatabase[req.params.id];
  let user = searchDb(req.params["id"], "id", userDb);
  let errors = "";
  let database = {};
  if (user["urls"]) {
    user["urls"].forEach((url) => {
      database[url] = urlDatabase[url];
    });
  }
  const templateVars = {
    urls: database,
    authenticated: false,
    errors: errors,
    user: user,
  };
  res.render("myUrls", templateVars);
});

//new func
//redirect /urls_new
app.get("/urls/new", (req, res) => {
  let help = new renderHelp({ id: req.session["id"], db: userDb, msgNo: "First you need to login", renderOk: "urls_new", renderNo: "login" });

  let id = req.session["id"];
  let authenticated = false;
  let user;
  if (id) {
    authenticated = true;
    user = searchDb(id, "id", userDb);
    const templateVars = {
      user: user,
      authenticated: authenticated,
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL],
    };
    res.render("urls_new", templateVars);
  } else {
    let errors = "First you need to login";
    const templateVars = {
      urls: urlDatabase,
      authenticated: false,
      errors: errors,
    };
    res.render("login", templateVars);
  }
});
class renderHelp {
  constructor({...myArgs}) {
    this.keys = [
      "msgOk",
      "id",
      "msgNo",
      "renderOk",
      "renderNo",
      "user ",
      "authenticated",
      "db",
      "resultDb",
      "key",
      "func",
    ];
    let argKeys = Object.keys(myArgs);
    for (let i = 0; i < 7; i++) {
      if (argKeys.includes(keys[i])) {
        this[keys[i]] = myArgs[keys[i]];
      } else {
        this[keys[i]] = "";
      }
    }
    for (let i = 7; i < 9; i++) {
      let argKeys = Object.keys(myArgs);
      if (argKeys.includes(keys[i])) {
        this[keys[i]] = myArgs[keys[i]];
      } else {
        this[keys[i]] = {};
      }
    }
    if (argKeys.includes("key")) {
      this.key = myArgs["key"];
    } else {
      this.key = "id";
    }
    if (argKeys.includes("func")) {
      this.func = myArgs["func"];
    } else {
      this.func = searchDb;
    }
  }
  findById(id_list, database) {
    let result = [];
    id_list.forEach((it) => {
    result.push(database[it])
    });
    return result;
  }
  createParam() {
  let  result = {
      user: this.user,
      authenticated:  this.authenticated,
      msgOk: this.msgOk,
      msgNo:  this.msgNo,
      resultDb: this.resultDb,
    };
    return result;
  }

  result() {
    if (id) {
      this.authenticated = true;
      this.user = func(this.id, this.key, this.db);
      this.resultDb = this.findById(this.user["urls"], this.db);
      let params = createParam();
      res.render(this.renderOk, params);
    } else {
      let params = createParam();
      res.render(this.renderNo, params);
    }
  }
}
