import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import { renderFile } from 'ejs';

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Permalist",
  password: "Shishir@2005",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.engine('html', renderFile);
app.set('view engine', 'html');

let items = [];
let loggedUserId = 0;

async function getItems() {
  const result = await db.query("SELECT * FROM items WHERE user_id=$1", [loggedUserId]);
  return result.rows;
}

app.get("/", async (req, res) => {
  if (loggedUserId) {
    items = await getItems();
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/logout", (req, res) => {
  loggedUserId = 0;
  res.redirect("/login");
})

app.post("/login", async (req, res) => {
  try {
    const username = req.body.username;
    const result = await db.query("SELECT * FROM users WHERE username=$1", [username]);
    if (result.rows.length) {
      if (result.rows[0].password === req.body.password) {
        loggedUserId = result.rows[0].id;
        res.redirect("/")
      } else {
        res.render("login.ejs", { err: "wrong password" });
      }
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
      const result_id = await db.query("INSERT INTO users(username, password) VALUES($1, $2) RETURNING id", [username, password]);
      loggedUserId = result_id.rows[0].id;
      res.redirect("/");
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
    await db.query("INSERT INTO items (title, user_id) VALUES ($1, $2)", [item, loggedUserId]);
    res.redirect("/");
  } catch (err) {
    console.log("error during adding : ", err);
    res.status(500).json({ err: err });
  }
});

app.post("/edit", async (req, res) => {
  try {
    const response = req.body;
    await db.query("UPDATE items SET title=$1 WHERE id=$2 AND user_id=$3", [response.updatedItemTitle, response.updatedItemId, loggedUserId]);
    res.redirect("/");
  } catch (err) {
    console.log("error during editing : ", err);
    res.status(500).json({ err: err });
  }
});

app.post("/delete", async (req, res) => {
  try {
    const response = req.body;
    db.query("DELETE FROM items WHERE id=$1 AND user_id=$2", [response.deleteItemId, loggedUserId]);
    res.redirect("/");
  } catch (err) {
    console.log("error during deleting : ", err);
    res.status(500).json({ err: err });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
