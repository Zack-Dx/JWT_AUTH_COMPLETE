import mongoose from "mongoose";

const connectDB = async (uri) => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("Database Connected Successfully");
  } catch (error) {
    console.log(error);
    console.log("Failed to connect Database");
  }
};

export default connectDB;
