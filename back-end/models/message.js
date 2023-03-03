const mongoose = require("mongoose");
module.exports = mongoose.Schema({
  senderID: { type: String, required: true },
  content: { type: String, required: true },
  sendAt: { type: Date, required: true },
});
