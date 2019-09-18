var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var NoteSchema = new Schema({
  title: String,
  body: String,
  saved: {
    type: Boolean,
    required: true,
    default: false
  }
});

var Note = mongoose.model("Note", NoteSchema);

module.exports = Note;
