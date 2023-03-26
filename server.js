import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/web.js";
import connectDB from "./database/connectDB.js";

const app = express();
const MONGO_DB_URI = process.env.MONGO_DB_URI;
const PORT = process.env.PORT || 6000;

// Middlewares
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);

// Server
app.listen(PORT, async () => {
  try {
    await connectDB(MONGO_DB_URI);
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.error(error);
    console.log("Failed to connect to the server.");
  }
});
