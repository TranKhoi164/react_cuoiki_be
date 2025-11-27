const express = require("express");
const mongoose = require("mongoose");
const database= require("./config/database")
const routes=require('./routes/indexRouter')
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

database.connect();

routes(app)

app.listen(5000, () => console.log("Server running on port 5000"));
