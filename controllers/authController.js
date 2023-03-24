import bcrypt from "bcryptjs";
import UserModel from "../models/User.js"; // Model Import

class AuthController {
  static async userSignup(req, res) {
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
  static async userLogin(req, res) {
    try {
      console.log("hit");
    } catch (error) {}
  }
}

export default AuthController;
