import express from "express";
const router = express.Router();

// Controller Imports
import AuthController from "../controllers/authController.js";

// Routes
router.post("/signup", AuthController.userSignup);
router.post("/login", AuthController.userLogin);

export default router;
