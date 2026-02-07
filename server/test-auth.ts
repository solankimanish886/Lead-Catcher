import request from "supertest";
import { app } from "./index";
import { db } from "./db";
import { users, agencies } from "@shared/schema";
import { eq } from "drizzle-orm";

async function testAuth() {
  console.log("Starting Auth tests...");
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = "password123";
  const testName = "Test User";
  const testAgency = "Test Agency";

  try {
    // 1. AUTH-001: Agency Owner Registration
    console.log("Testing Registration...");
    const regRes = await request(app)
      .post("/api/auth/register")
      .send({
        email: testEmail,
        password: testPassword,
        name: testName,
        agencyName: testAgency
      });

    if (regRes.status !== 201) {
      throw new Error(`Registration failed with status ${regRes.status}: ${JSON.stringify(regRes.body)}`);
    }
    console.log("✅ Registration passed");

    const cookie = regRes.headers['set-cookie'];

    // 2. AUTH-002: Login with Valid Credentials
    console.log("Testing Login...");
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: testEmail,
        password: testPassword
      });

    if (loginRes.status !== 200) {
      throw new Error(`Login failed with status ${loginRes.status}: ${JSON.stringify(loginRes.body)}`);
    }
    console.log("✅ Login passed");

    // 3. AUTH-003: Access Protected Route (/api/user)
    console.log("Testing Protected Route...");
    const userRes = await request(app)
      .get("/api/user")
      .set("Cookie", cookie);

    if (userRes.status !== 200) {
      throw new Error(`Protected route access failed with status ${userRes.status}`);
    }
    if (userRes.body.email !== testEmail) {
      throw new Error(`User data mismatch: expected ${testEmail}, got ${userRes.body.email}`);
    }
    console.log("✅ Protected route access passed");

    // 4. AUTH-004: Access Protected Route Without Token
    console.log("Testing Unauthorized Access...");
    const unauthRes = await request(app).get("/api/user");
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 for unauthorized access, got ${unauthRes.status}`);
    }
    console.log("✅ Unauthorized access prevention passed");

    console.log("\n✨ ALL AUTH TESTS PASSED! ✨");

    // Cleanup
    await db.delete(users).where(eq(users.email, testEmail));
    // Note: Agency cleanup could be added here if needed

  } catch (error) {
    console.error("\n❌ AUTH TEST FAILED:");
    console.error(error.message);
    process.exit(1);
  }
}

testAuth();
