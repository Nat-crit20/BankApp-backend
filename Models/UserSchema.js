const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

let userSchema = mongoose.Schema({
  Names: [
    {
      type: String,
      required: true,
    },
  ],
  Email: [
    {
      data: String,
      primary: Boolean,
      type: String,
    },
  ],
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
