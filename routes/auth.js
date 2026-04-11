const express = require("express");
const router = express.Router();
const { register, login, getMe, updateProfile, addAddress, getAllUsers, updateUserRole, toggleUserStatus } = require("../controllers/authController");
const { protect, superAdmin, adminOrAbove, allRoles } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", ...allRoles, getMe);
router.put("/profile", ...allRoles, updateProfile);
router.post("/address", ...allRoles, addAddress);
router.get("/users", ...adminOrAbove, getAllUsers);
router.put("/users/:id/role", ...superAdmin, updateUserRole);
router.put("/users/:id/toggle", ...superAdmin, toggleUserStatus);

module.exports = router;
