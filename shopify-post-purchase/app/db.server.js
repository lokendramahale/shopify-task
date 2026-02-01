import mongoose from "mongoose";

let isConnected = false;

export async function connectMongo() {
  if (isConnected) return;

  console.log("⏳ Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
  console.log("✅ MongoDB connected");
}
