const mongoose = require("mongoose");

let userSchema = mongoose.Schema({
  UserInfo: {
    Username: {
      type: String,
      required: true,
    },
    Password: {
      type: String,
      requited: true,
    },
    Email: {
      type: String,
      required: true,
    },
  },
  Access_token: {
    type: String,
    required: false,
  },
});

let User = mongoose.model("User", userSchema);

module.exports.User = User;
