var express = require("express");
var axios = require("axios");
var cheerio = require("cheerio");
var mongoose = require("mongoose");

var PORT = process.env.PORT || 3000;

//Are models even needed? Does this need to be connected to the external DB?
var db = require("./models");

var app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

app.get("/", function(req, res) {
  res.send("Hello world");
});

// Listening
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
