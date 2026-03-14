import mongoose from "mongoose";
import "dotenv/config";
import { UserModel } from "./server/models";
import { connectDB } from "./server/db";

async function verifyMigration() {
    try {
        await connectDB();
        const emails = await UserModel.find({}, { email: 1 }).lean();
        console.log("Emails in DB:");
        emails.forEach(u => {
            console.log(`- ${u.email}`);
            if (u.email !== u.email.toLowerCase()) {
                console.error(`FAILED: ${u.email} is not lowercased!`);
            }
        });

        const ronak = await UserModel.findOne({ name: /Ronak/i }).lean();
        if (ronak) {
            console.log("Ronak's email:", ronak.email);
            if (ronak.email === "ronak@abc.com") {
                console.log("SUCCESS: Ronak's email is lowercased.");
            } else {
                console.error("FAILED: Ronak's email is still:", ronak.email);
            }
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

verifyMigration();
