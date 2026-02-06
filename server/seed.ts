import { db } from "./db";
import { users, agencies, widgets, leads, notes } from "@shared/schema";
import { hash } from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  // Check if data exists
  const existingUsers = await db.select().from(users).limit(1);
  if (existingUsers.length > 0) {
    console.log("Database already seeded.");
    return;
  }

  // Create Agency
  const [agency] = await db.insert(agencies).values({
    name: "Demo Agency",
  }).returning();

  // Create Owner
  const hashedPassword = await hash("password123", 10);
  const [owner] = await db.insert(users).values({
    email: "demo@leadcatcher.com",
    password: hashedPassword,
    name: "Jane Doe",
    role: "owner",
    agencyId: agency.id,
  }).returning();

  console.log("Created owner:", owner.email);

  // Create Rep
  const [rep] = await db.insert(users).values({
    email: "rep@leadcatcher.com",
    password: hashedPassword,
    name: "John Smith",
    role: "rep",
    agencyId: agency.id,
  }).returning();

  console.log("Created rep:", rep.email);

  // Create Widget
  const [widget] = await db.insert(widgets).values({
    agencyId: agency.id,
    name: "Contact Us Form",
    fields: [
      { key: "name", label: "Full Name", type: "text", required: true },
      { key: "email", label: "Email Address", type: "email", required: true },
      { key: "message", label: "Message", type: "textarea", required: true },
    ],
    headingText: "Get in touch with us",
    primaryColor: "#0f172a",
  }).returning();

  console.log("Created widget:", widget.name);

  // Create Leads
  const [lead1] = await db.insert(leads).values({
    agencyId: agency.id,
    widgetId: widget.id,
    name: "Alice Johnson",
    email: "alice@example.com",
    formResponses: {
      name: "Alice Johnson",
      email: "alice@example.com",
      message: "Interested in your services.",
    },
    status: "new",
  }).returning();

  const [lead2] = await db.insert(leads).values({
    agencyId: agency.id,
    widgetId: widget.id,
    name: "Bob Williams",
    email: "bob@example.com",
    formResponses: {
      name: "Bob Williams",
      email: "bob@example.com",
      message: "Can you send pricing?",
    },
    status: "contacted",
    assignedTo: rep.id,
  }).returning();

  console.log("Created leads");

  console.log("Seeding complete!");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
