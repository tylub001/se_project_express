const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require('dotenv').config();
const mainRouter = require("./routes/index");
const errorHandler = require('./middlewares/error-handler');
const { errors } = require('celebrate');
const { requestLogger, errorLogger } = require('./middlewares/logger');



const app = express();
const { PORT = 3001 } = process.env;

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("Connected to DB");
  })
  .catch(console.error);

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use("/", mainRouter);

app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

/*app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "An error occurred on the server" });
  next(err);
});*/

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
