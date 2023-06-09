import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // JSON WEB TOKEN
import UserModel from "../models/User.js"; // Model Import
import transporter from "../config/emailConfig.js";

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
          user: {
            username,
            email,
          },
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

  // User Logout
  static async logoutUser(req, res) {
    try {
      // Clear the user's token from the cookies
      res.clearCookie("auth_token");

      return res.status(200).json({
        success: true,
        message: "User logged out successfully.",
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
      const { password, confirmpassword } = req.body;

      // Validate
      if (!password || !confirmpassword) {
        return res
          .status(422)
          .json({ success: false, message: "All fields are required." });
      }

      // Pass and ConfirmPassword Match

      if (password !== confirmpassword) {
        return res
          .status(404)
          .json({ success: false, message: "Passwords doesn't match" });
      }

      // Saving Password
      const hashPass = await bcrypt.hash(password, 10);

      // Changing Pass after Auth
      await UserModel.findByIdAndUpdate(req.user._id, {
        $set: { password: hashPass },
      });
      return res.status(200).json({
        success: true,
        message: "User password changed successfully!",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Something went wrong! Failed to change Password.",
      });
    }
  }

  // Loggedin User
  static async loggedinUser(req, res) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }
      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  // Forgot Password resend email

  static async sendUserPasswordResetEmail(req, res) {
    try {
      const { email } = req.body;
      // Validate
      if (!email) {
        return res
          .status(400)
          .json({ success: false, message: "Email field is required." });
      }
      // Email Check
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "Email isn't registered." });
      }
      // Email Send
      const secret = user._id + process.env.JWT_SECRET_KEY;
      const token = await jwt.sign({ user: user._id }, secret, {
        expiresIn: "10m",
      });
      const link = `http://localhost:5600/user-password-reset/${user._id}/${token}`;

      // Send Email
      let info = await transporter.sendMail({
        from: process.env.EMAIL_USER, // sender address
        to: user.email, // list of receivers
        subject: "Password Reset Email", // Subject line
        text: "Here is the link below to reset your password", // plain text body
        html: `
        <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.5;">
          <p style="margin-bottom: 30px;">Hello ${user.username},</p>
          <p style="margin-bottom: 30px;">You recently requested to reset your password.</p>
          <div style="background-color: #f7f7f7; padding: 20px; margin-bottom: 30px;">
            <p style="margin-bottom: 30px;">To reset your password, please click the button below:</p>
            <a href=${link} style="background-color: #007bff; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
          </div>
          <p style="margin-bottom: 30px;">This link is valid for 10 minutes.</p>
          <p style="margin-bottom: 0;">Thanks,</p>
          <p style="margin-bottom: 30px;">JWT Authentication Test APP.</p>
        </div>
      `,
      });
      return res.status(200).json({
        success: true,
        message:
          "Password reset link has been sent successfully, please reset your password within 10 minutes.",
        info,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error. Something went wrong.",
        error,
      });
    }
  }

  // Forgot Password Save

  static async userPasswordReset(req, res) {
    try {
      const { password, confirmPassword } = req.body;
      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Passwords do not match.",
        });
      }

      const { id, token } = req.params;
      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      // Generating Secret to authenticate
      const new_secret = user._id + process.env.JWT_SECRET_KEY;

      try {
        const verifyToken = await jwt.verify(token, new_secret);
        if (!verifyToken) {
          return res.status(401).json({
            success: false,
            message: "Invalid or expired token.",
          });
        }
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired token.",
        });
      }

      // Updating Password
      const newPass = await bcrypt.hash(password, 10);
      await UserModel.findByIdAndUpdate(user._id, {
        $set: {
          password: newPass,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Password reset successfully.",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error. Something went wrong",
      });
    }
  }
}

export default AuthController;
