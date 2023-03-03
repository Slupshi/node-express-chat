module.exports = function (io) {
  const sConversation = require("../models/conversation");
  io.on("connection", (socket) => {
    console.log(`Connecté au client ${socket.id}`);

    // Listener sur la déconnexion
    socket.on("disconnect", () => {
      console.log(`user ${socket.id} disconnected`);
    });

    socket.on("newMsg", async (res) => {
      var conv = await sConversation
        .findOne({ _id: res.conversationID })
        .then((data) => data);
      conv.messages.push(res.msg);
      await sConversation.findOneAndUpdate(
        { _id: conv._id },
        { messages: conv.messages },
        {
          returnOriginal: true,
        }
      );
      io.emit("newMsg", res);
    });

    socket.on("writing", (username) => {
      io.emit("writing", username);
    });
  });
};
