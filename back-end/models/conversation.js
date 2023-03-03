const mongoose = require("mongoose");
const messageSchema = require("./message");
const conversationSchema = mongoose.Schema({
  title: { type: String, required: true },
  participantsID: [{ type: String, required: true }],
  messages: [messageSchema],
  createdAt: { type: Date, required: true },
});

module.exports = mongoose.model("Conversation", conversationSchema);
