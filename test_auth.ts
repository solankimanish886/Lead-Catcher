import mongoose from "mongoose";
import "dotenv/config";
import { UserModel, getNextId } from "./server/models";
import { connectDB } from "./server/db";
import { hash, compare } from "bcryptjs";

async function testAuth() {
    try {
        await connectDB();

        const email = "test-agent-" + Date.now() + "@example.com";
        const plainPassword = "password123";
        const hashedPassword = await hash(plainPassword, 10);

        console.log("Creating test agent:", email);
        const id = await getNextId(UserModel);
        const user = await UserModel.create({
            _id: id,
            email: email,
            password: hashedPassword,
            name: "Test Agent",
            role: "agent",
            agencyId: 1,
            status: "active"
        });

        console.log("Verifying password for:", email);
        const isValid = await compare(plainPassword, user.password);
        console.log("Password is valid:", isValid);

        if (isValid) {
            console.log("Auth works for new agent!");
        } else {
            console.error("Auth FAILED for new agent!");
        }

        await UserModel.deleteOne({ _id: id });
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error("Error testing auth:", err);
        process.exit(1);
    }
}

testAuth();
