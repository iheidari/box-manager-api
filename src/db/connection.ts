import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const databaseUrl = process.env.DATABASE;
    
    if (!databaseUrl) {
      throw new Error("DATABASE connection string is not defined in environment variables");
    }

    await mongoose.connect(databaseUrl);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

