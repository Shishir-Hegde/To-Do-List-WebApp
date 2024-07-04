import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import { renderFile } from 'ejs';
import session from "express-session";
import env from "dotenv";
import bcrypt from "bcrypt"

const app = express();
const port = 3000;
const saltRounds = 5;
env.config();

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Permalist",
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
  secret : process.env.SESSION_SECRET,
  resave:false,
  saveUninitialized:true,
}));
app.engine('html', renderFile);
app.set('view engine', 'html');

async function getItems(userId, deadline) {
  const result = await db.query("SELECT * FROM items WHERE user_id=$1 AND deadline=$2", [userId, deadline]);
  return result.rows;
}

async function isLoggedIn(req) {
  return req.session.userId !== undefined;
}

app.get("/", async (req, res) => {
  if (await isLoggedIn(req)) {
    const {userId, deadline} = req.session;
    const items = await getItems(userId, deadline);
    res.render("index.ejs", {
      listTitle: deadline,
      listItems: items,
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.post("/logout", (req, res) => {
  req.session.destroy(err => {
    res.redirect("/login");
  });  
});

app.post("/today", (req, res) => {
  req.session.deadline = "today";
  res.redirect("/")
});

app.post("/this-week", (req, res) => {
  req.session.deadline = "this week";
  res.redirect("/");
});

app.post("/this-month", (req, res) => {
  req.session.deadline = "this month";
  res.redirect("/");
});

app.post("/login", async (req, res) => {
  try {
    const username = req.body.username;
    const result = await db.query("SELECT * FROM users WHERE username=$1", [username]);
    if (result.rows.length) {
      const user_id = result.rows[0].id;
      bcrypt.compare(req.body.password, result.rows[0].password, (err, compareResult) => {
        if(err) {
          console.log("error comparing:", err);
        } else {
          if(compareResult) {
            req.session.userId = user_id;
            req.session.deadline = "today";
            res.redirect("/")
          } else {
            res.render("login.ejs", { err: "wrong password" });
          }
        }
      });
    } else {
      res.render("login.ejs", { err: "user doesn't exist" });
    }
  } catch (err) {
    console.log("error during login : ", err);
    res.status(500).json({ err: err });
  }
});

app.post("/register", async (req, res) => {
  try {
    const username = req.body.username;
    const result = await db.query("SELECT * FROM users WHERE username=$1", [username]);
    if (!result.rows.length) {
      const password = req.body.password;
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if(err) {
          console.log("error in hashing:", err);
        } else {
          const result_id = await db.query("INSERT INTO users(username, password) VALUES($1, $2) RETURNING id", [username, hash]);
          req.session.userId = result_id.rows[0].id;
          req.session.deadline = "today";
          res.redirect("/");
        }
      });
    } else {
      res.render("login.ejs", { err: "user aldready exists, try logging in" });
    }
  } catch (err) {
    console.log("error during register : ", err);
    res.status(500).json({ err: err });
  }
});

app.post("/add", async (req, res) => {
  try {
    const item = req.body.newItem;
    await db.query("INSERT INTO items (title, user_id, deadline) VALUES ($1, $2, $3)", [item, req.session.userId, req.session.deadline]);
    res.redirect("/");
  } catch (err) {
    console.log("error during adding : ", err);
    res.status(500).json({ err: err });
  }
});

app.post("/edit", async (req, res) => {
  try {
    const response = req.body;
    await db.query("UPDATE items SET title=$1 WHERE id=$2 AND user_id=$3 AND deadline=$4", [response.updatedItemTitle, response.updatedItemId, req.session.userId, req.session.deadline]);
    res.redirect("/");
  } catch (err) {
    console.log("error during editing : ", err);
    res.status(500).json({ err: err });
  }
});

app.post("/delete", async (req, res) => {
  try {
    const response = req.body;
    db.query("DELETE FROM items WHERE id=$1 AND user_id=$2 AND deadline=$3", [response.deleteItemId, req.session.userId, req.session.deadline]);
    res.redirect("/");
  } catch (err) {
    console.log("error during deleting : ", err);
    res.status(500).json({ err: err });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});