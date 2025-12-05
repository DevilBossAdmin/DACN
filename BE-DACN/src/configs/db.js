import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Lấy URL từ biến môi trường
    const dbUrl = process.env.MONGO_URI;

    if (!dbUrl) {
      throw new Error("Missing MONGO_URI in environment variables");
    }

    // --- KẾT NỐI MONGODB ---
    await mongoose.connect(dbUrl);

    // --- LOG KIỂM TRA DB ĐÃ KẾT NỐI ---
    console.log("✅ Connected to MongoDB Atlas");
    console.log("✅ Connected DB:", mongoose.connection.name);
  } catch (error) {
    console.error("❌ Failed to connect MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;
