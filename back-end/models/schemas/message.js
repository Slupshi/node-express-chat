const mongoose = require("mongoose");

const senderSchema = require("./participant");

module.exports = mongoose.Schema({
  sender: senderSchema,
  content: { type: String, required: true },
  sendAt: { type: Date, required: true },
});
