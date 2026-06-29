const express = require("express");
const router = express.Router();
const { loginLeader } = require("../controllers/leaderController");
const { getLeader } = require("../controllers/leaderController");
const auth = require("../middleware/authMiddleware");
router.post("/login", loginLeader);
router.get("/get-leader", auth, getLeader);
module.exports = router;
