import "dotenv/config";
import { connectDB } from "./db";
import { UserModel } from "./models";

async function lowercaseEmails() {
    console.log("Starting email lowercase migration...");

    try {
        await connectDB();
        const users = await UserModel.find();
        console.log(`Checking ${users.length} users...`);

        let updatedCount = 0;

        for (const user of users) {
            const originalEmail = user.email;
            const lowerEmail = originalEmail.toLowerCase();

            if (originalEmail !== lowerEmail) {
                console.log(`Lowercasing email for user: ${originalEmail} -> ${lowerEmail} (ID: ${user._id})`);
                await UserModel.updateOne({ _id: user._id }, { email: lowerEmail });
                updatedCount++;
            }
        }

        console.log(`Migration complete. Updated ${updatedCount} users.`);
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

lowercaseEmails();
