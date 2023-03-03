const mongoose = require("mongoose");

const senderSchema = mongoose.Schema({
  senderID: { type: String, required: true },
  senderName: { type: String, required: true },
});

module.exports = mongoose.Schema({
  sender: senderSchema,
  content: { type: String, required: true },
  sendAt: { type: Date, required: true },
});
