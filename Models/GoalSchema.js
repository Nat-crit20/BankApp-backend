const mongoose = require("mongoose");

let goalSchema = mongoose.Schema({
  category: String,
  budget: String,
  amount: String,
});
