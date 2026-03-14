import "dotenv/config";
import { connectDB } from "./db";
import { UserModel } from "./models";
import { hash } from "bcryptjs";

async function migratePasswords() {
    console.log("Starting password migration...");

    try {
        await connectDB();
        const users = await UserModel.find();
        console.log(`Checking ${users.length} users...`);

        let updatedCount = 0;

        for (const user of users) {
            // bcrypt hashes usually start with $2a$, $2b$, or $2y$
            const isHashed = user.password.startsWith('$2a$') ||
                user.password.startsWith('$2b$') ||
                user.password.startsWith('$2y$');

            if (!isHashed) {
                console.log(`Hashing password for user: ${user.email} (ID: ${user._id})`);
                const hashedPassword = await hash(user.password, 10);
                await UserModel.updateOne({ _id: user._id }, { password: hashedPassword });
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

migratePasswords();
