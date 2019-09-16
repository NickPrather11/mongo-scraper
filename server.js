var express = require("express");
var axios = require("axios");
var cheerio = require("cheerio");
var mongoose = require("mongoose");

var PORT = process.env.PORT || 3000;

var db = require("./models");

var app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

app.get("/scrape", function(req, res) {
  axios.get("https://www.bbc.com/news/world").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $(".gs-c-promo").each(function(i, element) {
      // Save an empty result object
      var result = {};
      var articleTitle = $(this)
        .children(".gs-c-promo-body")
        .children("div")
        .children("a")
        .children("h3")
        .text();
      db.Article.find({ title: articleTitle }).then(function(response) {
        console.log("response: " + response);
        if (response) {
          // Add the text and href of every link, and save them as properties of the result object
          result.title = articleTitle;
          result.link = $(this)
            .children(".gs-c-promo-body")
            .children("div")
            .children("a")
            .attr("href");
          result.summary = $(this)
            .children(".gs-c-promo-body")
            .children("div")
            .children("p")
            .text();

          // Create a new Article using the `result` object built from scraping
          db.Article.create(result)
            .then(function(dbArticle) {
              console.log(dbArticle);
            })
            .catch(function(err) {
              console.log(err);
            });
        }
      });
      // Add the text and href of every link, and save them as properties of the result object
      result.title = articleTitle;
      result.link = $(this)
        .children(".gs-c-promo-body")
        .children("div")
        .children("a")
        .attr("href");
      result.summary = $(this)
        .children(".gs-c-promo-body")
        .children("div")
        .children("p")
        .text();
      result.image = $(this)
        .children(".gs-c-promo-image")
        .children(".gs-o-media-island")
        .children(".gs-o-responsive-image")
        .children("img")
        .attr("src");

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          console.log(err);
        });
    });

    res.json("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.delete("/articles", function(req, res) {
  db.Article.deleteMany({})
    .then(function(response) {
      console.log(response);
      res.status(200).end();
    })
    .catch(function(err) {
      if (err) throw err;
    });
  db.Note.deleteMany({})
    .then(function(response) {
      console.log(response);
      res.status(200).end();
    })
    .catch(function(err) {
      if (err) throw err;
    });
});

app.get("/notes", function(req, res) {
  db.Note.find({})
    .then(function(dbNote) {
      res.json(dbNote);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/notes/:id", function(req, res) {
  db.Note.findOne({ _id: req.params.id })
    .then(function(dbNote) {
      res.json(dbNote);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.delete("/notes/:id", function(req, res) {
  db.Note.findByIdAndDelete(req.params.id)
    .then(function(data) {
      res.json("Note Removed: " + data);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Listening
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
