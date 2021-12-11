const express = require("express");
var cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const app = express();
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

class renderHelp {
  constructor(res) {
    this.res = res;
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
  }
  findById(id_list, database) {
    let result = [];
 if(id_list.length > 0) {   id_list.forEach((it) => {
      result.push(database[it]);
    });}
    return result;
  }

  setParams(arr) {
    let argKeys = Object.keys(arr);
    for (let i = 0; i < 7; i++) {
      if (argKeys.includes(this.keys[i])) {
        this[this.keys[i]] = arr[this.keys[i]];
      } else {
        this[this.keys[i]] = "";
      }
    }
    for (let i = 7; i < 9; i++) {
      if (argKeys.includes(this.keys[i])) {
        this[this.keys[i]] = arr[this.keys[i]];
      } else {
        this[this.keys[i]] = {};
      }
    }
    if (argKeys.includes("key")) {
      this.key = arr["key"];
    } else {
      this.key = "id";
    }
    if (argKeys.includes("func")) {
      this.func = arr["func"];
    } else {
      this.func = searchDb;
    }
  }

  createParam() {
    let result = {
      user: this.user,
      authenticated: this.authenticated,
      msgOk: this.msgOk,
      msgNo: this.msgNo,
      resultDb: this.resultDb,
    };
    return result;
  }
  getErrorResult() {
    let params = this.createParam();
    this.res.render(this.renderNo, params);
  }
  getOkResult() {
    this.authenticated = true;

    this.user = this.func(this.id, this.key, this.db);
  /*   console.log(`user keys: ${Object.keys(this.user)}`);
    console.log(`user value: ${Object.keys(this.value)}`);
    console.log(`db keys: ${Object.keys(this.db)}`);
    console.log(`db values: ${Object.values(this.db)}`);
    console.log(`this id : ${this.id}`);
    console.log(`this key : ${this.key}`); */
    this.resultDb = this.findById(this.user["urls"], this.db);
    let params = this.createParam();
    this.res.render(this.renderOk, params);
  }
  getResult() {
    if (this.id) {
      this.getOkResult();
    } else {
      this.getErrorResult();
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
    id: "b2xVn2",
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
  let help = new renderHelp(res);
  if (req.session["id"]) {
    help.setParams({
      id: req.session["id"],
      db: userDb,
      renderOk: "urls_index",
    });
    help.getOkResult;

  }
  else {
    help.setParams({
      renderNo: "urls_index",
    });
    help.getErrorResult();
  }

});
//render url_show
app.get("/urls/:shortURL", (req, res) => {
  let help = new renderHelp(res);
  let id = req.session["id"];
  if (req.session["id"]) {
    authenticated = true;
    user = searchDb(id, "id", userDb);
    help.setParams({
      id: req.session["id"],
      db: userDb,
      renderOk: "urls_show",
    });
    help.getOkResult();
  } else {
    help.setParams({
      msgNo: "First you need to login",
      renderNo: "login",
    });
    help.getErrorResult();
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
  let help = new renderHelp(res);
  if (req.session["id"]) {
    authenticated = true;
    user = searchDb(id, "id", userDb);
    delete urlDatabase[req.body["shortURL"]];
    res.redirect("/urls");
  } else {
    help.setParams({ renderNo: "login", msgNo: "First you need to login" });
    help.getErrorResult();
  }
});
//redirect /urls/shortUrl
app.post("/urls/:shortURL/edit", (req, res) => {
  if (req.session["id"]) {
    urlDatabase[req.params.shortURL] = req.body.edit;
    res.redirect(`/urls/${req.params.shortURL}`);
  }
});

app.post("/login", (req, res) => {
  let help = new renderHelp(res);
  let user = searchDb(lowercase(req.body["email"]), "name", userDb);
  if (user) {
    if (bcrypt.compareSync(req.body["password"], user["hashedPassword"])) {
      req.session["id"] = user["id"];
      help.setParams({
        id: req.session["id"],
        db: userDb,
        renderOk: "urls_index",
      });
      help.getOkResult();
    } else {
      help.setParams({
        renderNo: "login",
        msgNo: "wrong username or password",
      });
      help.getErrorResult();
    }
  } else {
    help.setParams({
      renderNo: "login",
      msgNo: "this email is not registered ",
    });
    help.getErrorResult();
  }
});

app.get("/login", (req, res) => {
  let help = new renderHelp(res);
  help.setParams({ renderNo: "login" });
  help.getErrorResult();
});
app.get("/logout", (req, res) => {
  res.clearCookie("id");
  let help = new renderHelp(res);
  help.setParams({ renderNo: "urls_index" });
  help.getErrorResult();
});
//redirect /urls
app.post("/register", (req, res) => {
  let name = lowercase(req.body.email);
  let help = new renderHelp(res);
  if (!searchDb(name, "name", userDb)) {
    id = generateRandomString(8);
    let password = req.body["password"];
    const hashedPassword = bcrypt.hashSync(password, 10);
    let urls = [];
    userDb[id] = { id, name, hashedPassword, urls };
    req.session["id"] = id;
    help.setParams({
      id: req.session["id"],
      db: userDb,
      renderOk: "urls_index",
    });
    help.getOkResult();
  } else {
    help.setParams({
      renderNo: "register",
      msgNo: "this email already exists,please login! ",
    });
    help.getErrorResult();
  }
});
app.get("/register", (req, res) => {
  let help = new renderHelp(res);
  help.setParams({ renderNo: "register" });
  help.getErrorResult();
});
app.get("/urls/:user['name']", (req, res) => {
  let help = new renderHelp(res);
  help.setParams({
    id: req.session["id"],
    db: userDb,
    msgNo: "First you need to login",
    renderOk: "urls_new",
    renderNo: "login",
  });
  help.getResult();
});
//new func
//redirect /urls_new
app.get("/urls/new", (req, res) => {
  console.log("i am in /url/new");
  let help = new renderHelp(res);
  help.setParams({
    id: req.session["id"],
    db: userDb,
    msgNo: "First you need to login",
    renderOk: "urls_new",
    renderNo: "login",
  });
  help.getResult();
});
app.post("/urls/new", (req, res) => {
  let help = new renderHelp(res);
  if (req.session["id"]) {
    user = searchDb(id, "id", userDb);
    let key = generateRandomString(len);
    urlDatabase[key] = { id: key, user_id: req.session["id"], longURL: req.body.longURL };
    user.urls.push(key);
    help.setParams({
      id: req.session["id"],
      db: userDb,
      renderOk: "urls_index",
    });
    help.getOkResult();
  } else {
    help.setParams({ renderNo: "login", msgNo: "First you need to login" });
    help.getErrorResult();
  }
});

//check
//after creatingrender url_show
app.post("/newUrl", (req, res) => {
  let help = new renderHelp(res);
  help.setParams({
    id: req.session["id"],
    db: userDb,
    msgNo: "First you need to login",
    renderOk: "urls_show",
    renderNo: "login",
  });
  help.getResult();
});
