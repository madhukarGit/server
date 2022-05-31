const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { readdirSync } = require("fs");
const mongoose = require("mongoose");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

//database
mongoose
  .connect(process.env.DATABASE, {})
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB Error => ", err));

//route
readdirSync("./routes").map((r) => {
  return app.use("/api", require(`./routes/${r}`));
});

const port = process.env.PORT || 8000;

app.listen(port, () => console.log("server started ", port));
