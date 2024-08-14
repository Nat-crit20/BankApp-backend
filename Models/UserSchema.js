const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

let userSchema = mongoose.Schema({
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
  Access_token: {
    type: String,
    required: false,
  },
});

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = (password) => {
  return bcrypt.compareSync(password, this.Password);
};

let User = mongoose.model("User", userSchema);

module.exports.User = User;
