import mongoose from "mongoose";
import "dotenv/config";
import { UserModel } from "./server/models";
import { connectDB } from "./server/db";

async function checkUsers() {
    try {
        await connectDB();
        const users = await UserModel.find({}).lean();
        process.stdout.write("START_USERS_LIST\n");
        process.stdout.write(JSON.stringify(users, null, 2));
        process.stdout.write("\nEND_USERS_LIST\n");
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        process.stderr.write("ERROR_CHECKING_USERS: " + String(err) + "\n");
        process.exit(1);
    }
}

checkUsers();
