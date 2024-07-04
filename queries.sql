CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  user_id INTEGER REFERENCES users(id),
  deadline TEXT
);

CREATE TABLE users (
id SERIAL PRIMARY KEY,
username VARCHAR(50),
password TEXT
);