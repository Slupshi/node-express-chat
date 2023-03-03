module.exports = function (io) {
  io.on("connection", (socket) => {
    console.log(`Connecté au client ${socket.id}`);

    // Listener sur la déconnexion
    socket.on("disconnect", () => {
      console.log(`user ${socket.id} disconnected`);
    });

    socket.on("...", (msg) => {});
  });
};
