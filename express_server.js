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
      "user_id",
      "msgNo",
      "renderOk",
      "renderNo",
      "user",
      "authenticated",
      "url_id",
      "userDb",
      "urlDb",
      "resultDb",
      "key",
      "func",
      "oneItem ",
    ];
  }
  findById(id_list, database) {
    let result = [];
    if (id_list.length > 0) {
      id_list.forEach((it) => {
        result.push(database[it]);
      });
    }
    return result;
  }

  setParams(arr) {
    let argKeys = Object.keys(arr);
    for (let i = 0; i < 8; i++) {
      if (argKeys.includes(this.keys[i])) {
        this[this.keys[i]] = arr[this.keys[i]];
      } else {
        this[this.keys[i]] = "";
      }
    }
    for (let i = 8; i < 11; i++) {
      if (argKeys.includes(this.keys[i])) {
        this[this.keys[i]] = arr[this.keys[i]];
      } else {
        this[this.keys[i]] = [];
      }
    }
    if (argKeys.includes("key")) {
      this.key = arr["key"];
    } else {
      this.key = "user_id";
    }
    if (argKeys.includes("func")) {
      this.func = arr["func"];
    } else {
      this.func = searchDb;
    }
    if (argKeys.includes("oneItem")) {
      this.oneItem = arr["oneItem"];
    } else {
      this.oneItem = [];
    }
  }

  createParam() {
    let result = {
      user: this.user,
      url_id: this.url_id,
      user_id: this.user,
      authenticated: this.authenticated,
      msgOk: this.msgOk,
      msgNo: this.msgNo,
      resultDb: this.resultDb,
      oneItem: this.oneItem,
    };
    return result;
  }
  getErrorResult() {
    let params = this.createParam();
    this.res.render(this.renderNo, params);
  }
  addParam(x) {
    this.oneItem = x;
  }
  getOkResult() {
    this.authenticated = true;
    this.user = this.func(this.user_id, this.key, this.userDb);
    this.resultDb = this.findById(this.user["urls"], this.urlDb);
    let params = this.createParam();
    this.res.render(this.renderOk, params);
  }
  getResult() {
    if (this.user_id) {
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
    url_id: "b2xVn2",
    short: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    user_id: "b2xVn2",
  },
};
const userDb = {
  b2xVn2: {
    user_id: "b2xVn2",
    name: "fara",
    hashedPassword: bcrypt.hashSync(""),
    urls: [],
  },
  b: {
    user_id: "b",
    name: "pooyan",
    phashedPassword: "8234",
    urls: [],
  },
};
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

//redirect /urls/longurl
app.get("/u/:url_id", (req, res) => {
  let help = new renderHelp(res);
  let user_id = req.session["user_id"];
  let shortUrlS = Object.keys(urlDatabase);
  let url_id = req.params.url_id;
  if (shortUrlS.includes(url_id)) {
    let urlObj = urlDatabase["url_id"];
    let url = urlObj["longURL"];
    res.redirect(url);
  } else {
    res.status(404).send;
  }
});
//redirect /urls
app.post("/urls/:url_id/delete", (req, res) => {
  let help = new renderHelp(res);
  let user_id = req.session.user_id;
  let url_id = req.params.url_id;
  let user = searchDb(user_id, "user_id", userDb);

  if (user_id) {
    if (user.urls.length > 0) {
      if (user.urls.includes(req.params.url_id)) {
        authenticated = true;
        delete urlDatabase[url_id];
        help.setParams({
          user_id: req.session["user_id"],
          userDb: userDb,
          urlDb: urlDatabase,
          renderOk: "urls_index",
        });
        help.getOkResult;
      } else {
        help.setParams({
          user_id: req.session["user_id"],
          userDb: userDb,
          urlDb: urlDatabase,
          msgNo: "you doesn't have this url",
          renderOk: "urls_index",
        });
        help.getOkResult;
      }
    } else {
      help.setParams({
        user_id: req.session["user_id"],
        userDb: userDb,
        urlDb: urlDatabase,
        msgNo: "you doesn't have this url",
        renderOk: "urls_index",
      });
      help.getOkResult;
    }
  } else {
    help.setParams({ renderNo: "login", msgNo: "First you need to login" });
    help.getErrorResult();
  }
});
app.post("/urls/:url_id", (req, res) => {
  let help = new renderHelp(res);
  let url_id = req.params.url_id;
  let user_id = req.session["user_id"];
  if (user_id) {
    user = searchDb(user_id, "user_id", userDb);
    urlDatabase[url_id]["longURL"] = req.body.edit;
    help.setParams({
      oneItem: urlDatabase[url_id],
      url_id: url_id,
      user_id: user_id,
      userDb: userDb,
      urlDb: urlDatabase,
      renderOk: "urls_index",
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
//redirect /urls/url_id
app.get("/urls/:url_id", (req, res) => {
  let help = new renderHelp(res);
  let user_id = req.session.user_id;
  let url_id = req.params.url_id;
  if (user_id) {
    let user = searchDb(lowercase(user_id), "user_id", userDb);
    if (user.urls.includes(url_id)) {
      help.setParams({
        oneItem: urlDatabase[url_id],
        url_id: url_id,
        user_id: user_id,
        userDb: userDb,
        urlDb: urlDatabase,
        renderOk: "urls_show",
      });
      help.getOkResult();
    } else {
      help.setParams({
        renderNo: "login",
        msgNo: "you doesn't have this url ",
      });
      help.getErrorResult();
    }
  } else {
    help.setParams({
      renderNo: "login",
      msgNo: "you should login ",
    });
    help.getErrorResult();
  }
});

app.post("/login", (req, res) => {
  let help = new renderHelp(res);
  let user = searchDb(lowercase(req.body["email"]), "name", userDb);
  if (user) {
    if (bcrypt.compareSync(req.body["password"], user["hashedPassword"])) {
      req.session["user_id"] = user["user_id"];
      help.setParams({
        user_id: req.session["user_id"],
        userDb: userDb,
        urlDb: urlDatabase,
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
  if (!req.session["user_id"]) {
    let help = new renderHelp(res);
    help.setParams({ renderNo: "login" });
    help.getErrorResult();
  } else {
    res.redirect("/urls");
  }
});
app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});
//redirect /urls
app.post("/register", (req, res) => {
  let name = lowercase(req.body.email);
  let help = new renderHelp(res);
  if (!searchDb(name, "name", userDb)) {
    user_id = generateRandomString(8);
    let password = req.body["password"];
    const hashedPassword = bcrypt.hashSync(password, 10);
    let urls = [];
    userDb[user_id] = { user_id, name, hashedPassword, urls };
    req.session["user_id"] = user_id;
    help.setParams({
      user_id: req.session["user_id"],
      userDb: userDb,
      urlDb: urlDatabase,
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
app.get("/new", (req, res) => {
  let help = new renderHelp(res);
  help.setParams({
    user_id: req.session["user_id"],
    userDb: userDb,
    urlDb: urlDatabase,
    msgNo: "First you need to login or register if you doesn't have an account",
    renderOk: "urls_new",
    renderNo: "login",
  });
  help.getResult();
});
// render url_index
app.get("/urls", (req, res) => {
  let help = new renderHelp(res);
  if (req.session["id"]) {
    help.setParams({
      user_id: req.session["user_id"],
      userDb: userDb,
      urlDb: urlDatabase,
      renderOk: "urls_index",
    });
    help.getOkResult;
  } else {
    help.setParams({
      renderNo: "urls_index",
    });
    help.getErrorResult();
  }
});
// post new url
app.post("/urls", (req, res) => {
  let help = new renderHelp(res);
  let user_id = req.session["user_id"];
  if (user_id) {
    user = searchDb(user_id, "user_id", userDb);
    let key = generateRandomString(6);
    urlDatabase[key] = {
      url_id: key,
      user_id: user_id,
      longURL: req.body.longURL,
      shortURL: key,
    };
    user.urls.push(key);
    help.setParams({
      user_id: user_id,
      url_id: key,
      userDb: userDb,
      urlDb: urlDatabase,
      renderOk: "urls_index",
      oneItem: urlDatabase[key],
    });
    help.getOkResult();
  } else {
    help.setParams({ renderNo: "login", msgNo: "First you need to login" });
    help.getErrorResult();
  }
});
app.get("/", (req, res) => {
  let help = new renderHelp(res);
  let user_id = req.session.user_id;
  if (!user_id) {
    help.setParams({ renderNo: "login" });
    help.getErrorResult();
  } else {
    res.redirect("/urls");
  }

  /*   let help = new renderHelp(res);
  help.setParams({
    id: req.session["id"],
    userDb: userDb,
    urlDb:urlDatabase,
    msgNo: "First you need to login",
    renderOk: "urls_index",
    renderNo: "login",
  });
  help.getResult(); */
});
