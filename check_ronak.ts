import mongoose from "mongoose";
import "dotenv/config";
import { UserModel } from "./server/models";
import { connectDB } from "./server/db";

async function checkSpecificUser() {
    try {
        await connectDB();
        const user = await UserModel.findOne({ name: /Ronak/i }).lean();
        if (user) {
            process.stdout.write("USER_FOUND\n");
            process.stdout.write(JSON.stringify(user, null, 2));
            process.stdout.write("\n");
        } else {
            process.stdout.write("USER_NOT_FOUND\n");
        }
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        process.stderr.write("ERROR: " + String(err) + "\n");
        process.exit(1);
    }
}

checkSpecificUser();
