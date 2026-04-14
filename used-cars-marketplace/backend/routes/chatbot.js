const express = require("express");
const router = express.Router();
const { chatbot } = require("../controllers/Chatbotcontroller")
const verifyToken = require("../middleware/auth");

router.post("/", verifyToken, chatbot);

module.exports = router;