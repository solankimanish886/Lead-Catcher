import { UserModel } from "./models";
import { connectDB } from "./db";
import dotenv from "dotenv";

dotenv.config();

async function migrate() {
    try {
        console.log("Checking environment...");
        console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Defined" : "UNDEFINED");

        await connectDB();
        console.log("Migration started...");

        // 1. rep -> agent
        const repUpdate = await UserModel.updateMany({ role: "rep" }, { $set: { role: "agent" } });
        console.log(`Migrated ${repUpdate.modifiedCount} users from 'rep' to 'agent'.`);

        // 2. admin -> owner
        const adminUpdate = await UserModel.updateMany({ role: "admin" }, { $set: { role: "owner" } });
        console.log(`Migrated ${adminUpdate.modifiedCount} users from 'admin' to 'owner'.`);

        // 3. Remove/Fix any other roles (optional safeguard)
        const others = await UserModel.find({ role: { $nin: ["owner", "agent"] } });
        if (others.length > 0) {
            console.log(`Found ${others.length} users with unsupported roles. Setting to 'agent'...`);
            await UserModel.updateMany({ role: { $nin: ["owner", "agent"] } }, { $set: { role: "agent" } });
        }

        console.log("Migration completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();
