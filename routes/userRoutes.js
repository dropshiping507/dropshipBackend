const express = require("express");
const router = express.Router();

const {
  bindBankCard,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getProfile,
  updateBalanceByAdmin,
  updateUserDetailsByLeader,
  editNotesByAdmin,
  logoutUser,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const { changePassword } = require("../controllers/resetPasswordController");
// bind bank card
router.put("/bind-bank-card", bindBankCard);

// profile (logged-in user)
router.get("/profile", authMiddleware, getProfile);

// edit notes
router.put("/edit-notes/:id", editNotesByAdmin);

// update balance by admin
router.put("/update-balance/:id", updateBalanceByAdmin);

// change password
router.put("/change-password", authMiddleware, changePassword);

// logout user
router.put("/logout", authMiddleware, logoutUser);

// for leader
router.get("/all-users", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.patch("/update-users-leader/:id", updateUserDetailsByLeader);

module.exports = router;
