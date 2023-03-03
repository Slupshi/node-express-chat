const mongoose = require("mongoose");
const messageSchema = require("./schemas/message");
const participantSchema = require("./schemas/participant");
const conversationSchema = mongoose.Schema({
  title: { type: String, required: true },
  participants: [participantSchema],
  messages: [messageSchema],
  createdAt: { type: Date, required: true },
});

module.exports = mongoose.model("Conversation", conversationSchema);
