module.exports = function (app) {
  const authRoutes = require("./routes/authRoutes");
  app.use("/auth", authRoutes);
  const userRoutes = require("./routes/userRoutes");
  app.use("/users", userRoutes);
  const conversationRoutes = require("./routes/conversationRoutes");
  app.use("/conversations", conversationRoutes);
};
