import express from "express";
const router = express.Router();

// Controller Imports
import AuthController from "../controllers/authController.js";

// Auth Middleware
import userAuth from "../middlewares/authMiddleware.js";

// Public Routes
router.post("/signup", AuthController.signupUser);
router.post("/login", AuthController.loginUser);
router.post("/forgot-password", AuthController.sendUserPasswordResetEmail);
router.post(
  "/user-password-reset/:id/:token",
  AuthController.userPasswordReset
);

// Protected Routes
router.get("/user", userAuth, AuthController.loggedinUser);
router.post("/changepassword", userAuth, AuthController.changeUserPassword);
router.post("/logout", userAuth, AuthController.logoutUser);

export default router;
