const express = require("express");
const router = express.Router();
const { chatbot } = require("../controllers/Chatbotcontroller")
const { handleChatQuery, getChatSessionById } = require("../controllers/Chatbotcontroller");
const verifyToken = require("../middleware/auth");

router.post("/", verifyToken, chatbot);
router.post("/query", verifyToken, handleChatQuery);
router.get("/sessions/:id", verifyToken, getChatSessionById);

module.exports = router;