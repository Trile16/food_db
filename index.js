const express = require("express");
const app = express();
const pg = require("pg");
const client = new pg.Client("postgres://localhost/food_db");

app.use("/", (req, res, next) => {
  console.log("I am in this express server!");
  next();
});

// GET ALL FOOD ITEMS
app.get("/api/food", async (req, res, next) => {
  try {
    const SQL = `SELECT * FROM food;`;

    const response = await client.query(SQL);

    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

app.get("/api/food/:id", async (req, res, next) => {
  try {
    // console.log(req.params.id);

    const SQL = `SELECT * FROM food WHERE id=$1;`;

    const response = await client.query(SQL, [req.params.id]);
    console.log(response.rows);

    if (!response.rows.length) {
      next({
        name: "MissingIDError",
        message: `Food with id ${req.params.id} not found`,
      });
    }

    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/food/:id", async (req, res, next) => {
  console.log("req.params.id", req.params.id);

  const SQL = `DELETE FROM food WHERE id=$1;`;

  const response = await client.query(SQL, [req.params.id]);
  console.log(response.rows);

  res.sendStatus(204);
});

//ERROR HANDLER!

app.use((error, req, res, next) => {
  res.status(500);
  res.send(error);
});

const start = async () => {
  // connect to the database;
  client.connect();

  const SQL = `
  DROP TABLE IF EXISTS food;
    CREATE TABLE food(
        id SERIAL PRIMARY KEY,
        name VARCHAR(25)
    );
    INSERT INTO food(name) VALUES ('pizza');
    INSERT INTO food(name) VALUES ('sushi');
    INSERT INTO food(name) VALUES ('cannoli');
  `;

  // information seeding
  await client.query(SQL);

  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`The server is listening on port ${port}`);
  });
};

start();
