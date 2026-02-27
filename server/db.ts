import mongoose from "mongoose";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set to a valid MongoDB URI.");
}

export const connectDB = async (): Promise<typeof mongoose> => {
  await mongoose.connect(process.env.DATABASE_URL as string);
  console.log("Connected to MongoDB successfully.");
  return mongoose;
};

export const db = mongoose.connection;
