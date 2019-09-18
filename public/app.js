function showArticles() {
  // Grab the articles as a json
  $.getJSON("/articles", function(data) {
    for (var i = 0; i < data.length; i++) {
      var imgHTML = "<img src='" + data[i].image + "'>";

      var articleHTML =
        "<p data-id='" +
        data[i]._id +
        "'>" +
        data[i].title +
        "<br />" +
        data[i].author +
        "<br />" +
        "</p><button id='saveArticle'>Save</button><a href='" +
        data[i].link +
        "' target='_blank'>" +
        data[i].link +
        "</a><hr><br /><br />";

      var imgDiv = $("<div>").addClass("col-lg-3");
      imgDiv.append(imgHTML);
      var articleDiv = $("<div>").addClass("col-lg-9");
      articleDiv.append(articleHTML);

      var itemDiv = $("<div>").addClass("row");
      itemDiv.append(imgDiv);
      itemDiv.append(articleDiv);

      $("#articles").append(itemDiv);
    }
  });
}

function showSavedArticles() {
  // Grab the articles as a json
  $.getJSON("/saved-articles", function(data) {
    for (var i = 0; i < data.length; i++) {
      var imgHTML = "<img src='" + data[i].image + "'>";

      var articleHTML =
        "<p data-id='" +
        data[i]._id +
        "'>" +
        data[i].title +
        "<br />" +
        data[i].author +
        "<br />" +
        "</p><button id='unsaveArticle'>Unsave</button><a href='" +
        data[i].link +
        "' target='_blank'>" +
        data[i].link +
        "</a><hr><br /><br />";

      var imgDiv = $("<div>").addClass("col-lg-3");
      imgDiv.append(imgHTML);
      var articleDiv = $("<div>").addClass("col-lg-9");
      articleDiv.append(articleHTML);

      var itemDiv = $("<div>").addClass("row");
      itemDiv.append(imgDiv);
      itemDiv.append(articleDiv);

      $("#articles").append(itemDiv);
    }
  });
}

showArticles();

//scrape button onClick function
$(document).on("click", "#scrape", function() {
  $.ajax({
    method: "GET",
    url: "/scrape"
  }).then(function() {
    showArticles();
  });
});

// Whenever someone clicks a p tag
$(document).on("click", "p", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      $("#notes").append("<h2>" + data.title + "</h2>");
      $("#notes").append("<input id='titleinput' name='title' >");
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
        $("#notes").append("<button note-id='" + data.note._id + "' id='deletenote'>Delete Note</button>");
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});

//Delete note
$(document).on("click", "#deletenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("note-id");

  $.ajax({
    method: "DELETE",
    url: "/notes/" + thisId
  }).then(function(data) {
    console.log(data);
    // Empty the notes section
    $("#notes").empty();
    $("#notes").html("<h4>NOTE REMOVED!</h4>");
  });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});

//Clear all results
$(document).on("click", "#clearResults", function() {
  $.ajax({
    method: "DELETE",
    url: "/articles"
  }).then(function(data) {
    $("#articles").empty();
    $("#notes").empty();
    console.log("All scraped entries cleared");
  });
});

//Save an Article
$(document).on("click", "#saveArticle", function() {
  var thisId = $(this)
    .parent()
    .children("p")
    .attr("data-id");

  $.ajax({
    type: "POST",
    url: "/updateSaved/" + thisId,
    dataType: "json",
    data: {
      saved: true
    },
    // On successful call
    success: function(data) {
      console.log("Updated: " + data);
    }
  });

  $("#articles").empty();
  showArticles();
});

//Unsave an Article
$(document).on("click", "#unsaveArticle", function() {
  var thisId = $(this)
    .parent()
    .children("p")
    .attr("data-id");

  $.ajax({
    type: "POST",
    url: "/updateUnsaved/" + thisId,
    dataType: "json",
    data: {
      saved: false
    },
    // On successful call
    success: function(data) {
      console.log("Updated: " + data);
      $("#articles").empty();
      showSavedArticles();
    }
  });
});

$(document).on("click", "#allSaved", function() {
  $("#articles").empty();
  $("#notes").empty();
  $.ajax({
    type: "GET",
    url: "/saved-articles"
  }).then(function(response) {
    console.log(response);
    if (response) {
      showSavedArticles();
    } else {
      $("#articles").append("<p>No Saved Articles</p>");
    }
  });
});

$(document).on("click", "#allArticles", function() {
  $("#articles").empty();
  $("#notes").empty();
  showArticles();
});
