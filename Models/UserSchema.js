const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

let userSchema = mongoose.Schema({
  Username: {
    type: String,
    required: true,
  },
  First: {
    type: String,
    required: true,
  },
  Last: {
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
  Access_token: {
    type: String,
    required: false,
  },
  Goals: [{ type: mongoose.Schema.Types.ObjectId, ref: "Goal" }],
});

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = (password) => {
  return bcrypt.compareSync(password, this.Password);
};

let User = mongoose.model("User", userSchema);

module.exports.User = User;
