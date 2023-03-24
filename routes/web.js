import express from "express";
const router = express.Router();

// Controller Imports
import AuthController from "../controllers/authController.js";

// Public Routes
router.post("/signup", AuthController.signupUser);
router.post("/login", AuthController.loginUser);

export default router;
