require('dotenv').config()
const express = require("express");
const app = express();
const cors  = require("cors");
const connection = require("./database.js")
const router = require("./routes/router.js");
const cookieParser = require('cookie-parser');

// database

// middlewares
app.use(express.json());
app.use(cookieParser())
app.use(router);
// app.use(cors());
const port = process.env.PORT || 6999;


app.listen(port, ()=>{
    console.log(`server running on ${port}`)
});