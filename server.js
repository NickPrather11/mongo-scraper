var express = require("express");
var axios = require("axios");
var cheerio = require("cheerio");
var mongoose = require("mongoose");
var mongojs = require("mongojs");

var PORT = process.env.PORT || 3000;

var db = require("./models");

var app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

//Scrape new articles
app.get("/scrape", function(req, res) {
  axios.get("https://thehardtimes.net/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $(".post article").each(function(i, element) {
      // Save an empty result object
      var result = {};

      result.title = $(this)
        .children(".post-header")
        .children("h2")
        .children("a")
        .text();
      result.link = $(this)
        .children(".post-header")
        .children("h2")
        .children("a")
        .attr("href");
      result.author = $(this)
        .children(".post-header")
        .children(".post-byline")
        .text();
      result.image = $(this)
        .children(".featured-image")
        .children("a")
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

// Get all articles
app.get("/articles", function(req, res) {
  db.Article.find({ saved: false })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

//Get saved articles
app.get("/saved-articles", function(req, res) {
  db.Article.find({ saved: true })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Get specific article and populate with note
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

// Save/update a note
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

//clear articles
app.delete("/articles", function(req, res) {
  db.Article.deleteMany({ saved: false })
    .then(function(response) {
      console.log(response);
      res.status(200).end();
    })
    .catch(function(err) {
      if (err) throw err;
    });
  db.Note.deleteMany({ saved: false })
    .then(function(response) {
      console.log(response);
      res.status(200).end();
    })
    .catch(function(err) {
      if (err) throw err;
    });
});

//Get notes
app.get("/notes", function(req, res) {
  db.Note.find({})
    .then(function(dbNote) {
      res.json(dbNote);
    })
    .catch(function(err) {
      res.json(err);
    });
});

//Get a specific note
app.get("/notes/:id", function(req, res) {
  db.Note.findOne({ _id: req.params.id })
    .then(function(dbNote) {
      res.json(dbNote);
    })
    .catch(function(err) {
      res.json(err);
    });
});

//Delete specific note
app.delete("/notes/:id", function(req, res) {
  db.Note.findByIdAndDelete(req.params.id)
    .then(function(data) {
      res.json("Note Removed: " + data);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Update for saving an article
app.post("/updateSaved/:id", function(req, res) {
  db.Article.updateOne(
    {
      _id: mongojs.ObjectId(req.params.id)
    },
    {
      $set: {
        saved: true
      }
    },
    function(err, edited) {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        console.log(edited);
        res.send(edited);
      }
    }
  );
});

//Update for unsaving an article
app.post("/updateUnsaved/:id", function(req, res) {
  db.Article.updateOne(
    {
      _id: mongojs.ObjectId(req.params.id)
    },
    {
      $set: {
        saved: false
      }
    },
    function(err, edited) {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        console.log(edited);
        res.send(edited);
      }
    }
  );
});

// Listening
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
