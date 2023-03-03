const mongoose = require("mongoose");

module.exports = mongoose.Schema(
  {
    userID: { type: String, required: true },
    userName: { type: String, required: true },
  },
  { _id: false }
);
