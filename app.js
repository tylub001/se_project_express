const express = require("express");
const mongoose = require("mongoose");
const mainRouter = require("./routes/index");

const app = express();
const { PORT = 3001 } = process.env;

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("Connected to DB");
  })
  .catch(console.error);

app.use(express.json());
app.use((req, res, next) => {
  req.user = {
    _id: "6831d5eeeb83d9f8891d8afa",
  };
  next();
});

app.use("/", mainRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "An error occurred on the server" });
  next(err); // This satisfies ESLint but won't actually run
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
