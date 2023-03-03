const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth");

const userController = require("../controllers/userController");
router.get("/", authMiddleware, userController.getAll);
router.get("/:id", authMiddleware, userController.get);
router.post("/", authMiddleware, userController.post);
router.put("/:id", authMiddleware, userController.put);
router.delete("/:id", authMiddleware, userController.delete);

module.exports = router;
