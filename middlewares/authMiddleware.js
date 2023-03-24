import jwt from "jsonwebtoken";
import UserModel from "../models/User.js";

const userAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized User. No Token" });
    }

    const { userId } = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await UserModel.findById(userId).select("-password");
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized User" });
  }
};

export default userAuth;
