const mongoose = require("mongoose");

let goalSchema = mongoose.Schema({
  Category: String,
  Budget: String,
  Amount: String,
});

let Goal = mongoose.model("Goal", goalSchema);

module.exports.Goal = Goal;
