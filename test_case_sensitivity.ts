import mongoose from "mongoose";
import "dotenv/config";
import { UserModel, getNextId } from "./server/models";
import { connectDB } from "./server/db";

async function testCaseSensitivity() {
    try {
        await connectDB();

        const email = "Test-Case-" + Date.now() + "@Example.com";
        const id = await getNextId(UserModel);
        await UserModel.create({
            _id: id,
            email: email,
            password: "hashed_password",
            name: "Test Case",
            role: "agent",
            agencyId: 1,
            status: "active"
        });

        console.log("Created user with email:", email);

        const foundExact = await UserModel.findOne({ email });
        console.log("Found with exact case:", !!foundExact);

        const foundLower = await UserModel.findOne({ email: email.toLowerCase() });
        console.log("Found with lower case:", !!foundLower);

        await UserModel.deleteOne({ _id: id });
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error("Error testing case sensitivity:", err);
        process.exit(1);
    }
}

testCaseSensitivity();
