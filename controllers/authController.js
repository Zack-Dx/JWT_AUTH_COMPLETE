import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // JSON WEB TOKEN
import UserModel from "../models/User.js"; // Model Import

class AuthController {
  // User Sign Up
  static async signupUser(req, res) {
    try {
      const { username, email, password } = req.body;

      // Validation
      if (!username || !email || !password) {
        return res
          .status(400) // Bad Request
          .send({ success: false, message: "All fields are required." });
      }

      // Existing User Check
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res
          .status(409) // Conflict
          .send({ success: false, message: "User is already registered." });
      }

      // Hashing User Password
      const hashPass = await bcrypt.hash(password, 10);

      // New User Registration
      const user = await new UserModel({
        username,
        email,
        password: hashPass,
      });

      await user.save();
      return res
        .status(201) // Created
        .send({
          success: true,
          message: "User registered successfully.",
          user,
        });
    } catch (error) {
      console.log(error);
      return res
        .status(500) // Internal Server Error
        .send({ success: false, message: "Something went wrong", error });
    }
  }

  // User Login
  static async loginUser(req, res) {
    try {
      const { email, password } = req.body;

      // Validate
      if (!email || !password) {
        return res.status(422).json({
          success: false,
          message: "Unprocessable Entity. All fields are required.",
        });
      }

      //Find User
      const user = await UserModel.findOne({ email });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Not Found. User isn't registered. Please Sign up!",
        });
      }

      // Compare Passwords
      const passMatch = await bcrypt.compare(password, user.password);
      if (!passMatch) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized. Invalid Credentials",
        });
      }

      // Generate JWT Token
      const token = await jwt.sign(
        { user: user._id },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "5d",
        }
      );

      return res.status(200).json({
        success: true,
        message: "User logged in successfully.",
        user: {
          username: user.username,
          email: user.email,
        },
        token,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        message: "Internal Server Error. Something went wrong",
        error,
      });
    }
  }

  // Change User Password
  static async changeUserPassword(req, res) {
    try {
      const { password, confirmPassword } = req.body;

      // Validate
      if (!password || !confirmPassword) {
        return res
          .status(422)
          .json({ success: false, message: "All fields are required." });
      }

      // Pass and ConfirmPassword Match

      if (password !== confirmPassword) {
        return res
          .status(404)
          .json({ success: false, message: "Passwords doesn't match" });
      }

      // Saving Password
      const hashPass = await bcrypt.hash(password, 10);
    } catch (error) {}
  }
}

export default AuthController;
