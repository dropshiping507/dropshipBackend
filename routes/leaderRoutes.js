const express = require("express");
const router = express.Router();
const {
  loginLeader,
  getLeader,
  logoutLeader,
} = require("../controllers/leaderController");
const auth = require("../middleware/authMiddleware");
router.post("/login", loginLeader);
router.get("/get-leader", auth, getLeader);
router.post("/logout", auth, logoutLeader);
module.exports = router;
