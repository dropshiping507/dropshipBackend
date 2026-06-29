const express = require("express");
const {
  createInjection,
  getUserInjectionById,
  updateInjectionStatus,
  deleteInjection,
  rejectInjectionByAdmin,
} = require("../controllers/injectionController");
const router = express.Router();

// create injection
router.post("/create", createInjection);
router.get("/:id", getUserInjectionById);
router.put("/update-injection-status/:id", updateInjectionStatus);
router.delete("/delete-injection/:id", deleteInjection);
router.put("/reject/:id", rejectInjectionByAdmin);
module.exports = router;
