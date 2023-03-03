const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth");

const conversationController = require("../controllers/conversationController");
router.get("/", authMiddleware, conversationController.getAll);
router.get("/:id", authMiddleware, conversationController.get);
router.post("/", authMiddleware, conversationController.post);
router.put("/:id", authMiddleware, conversationController.put);
router.delete("/:id", authMiddleware, conversationController.delete);
router.post("/own", authMiddleware, conversationController.own);

module.exports = router;
