import { db } from "./db";
import { UserModel, AgencyModel, WidgetModel, LeadModel, getNextId } from "./models";
import { hash } from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  // Check if data exists
  const existingUsers = await UserModel.find().limit(1);
  if (existingUsers.length > 0) {
    console.log("Database already seeded.");
    return;
  }

  // Create Agency
  const agencyId = await getNextId(AgencyModel);
  const agency = await AgencyModel.create({
    _id: agencyId,
    name: "Demo Agency",
  });

  // Create Owner
  const hashedPassword = await hash("password123", 10);
  const ownerId = await getNextId(UserModel);
  const owner = await UserModel.create({
    _id: ownerId,
    email: "demo@leadcatcher.com",
    password: hashedPassword,
    name: "Jane Doe",
    role: "owner",
    agencyId: agency._id,
  });

  console.log("Created owner:", owner.email);

  // Create Rep
  const repId = ownerId + 1;
  const rep = await UserModel.create({
    _id: repId,
    email: "rep@leadcatcher.com",
    password: hashedPassword,
    name: "John Smith",
    role: "rep",
    agencyId: agency._id,
  });

  console.log("Created rep:", rep.email);

  // Create Widget
  const widgetId = await getNextId(WidgetModel);
  const widget = await WidgetModel.create({
    _id: widgetId,
    agencyId: agency._id,
    name: "Contact Us Form",
    fields: [
      { key: "name", label: "Full Name", type: "text", required: true },
      { key: "email", label: "Email Address", type: "email", required: true },
      { key: "message", label: "Message", type: "textarea", required: true },
    ],
    headingText: "Get in touch with us",
    primaryColor: "#0f172a",
  });

  console.log("Created widget:", widget.name);

  // Create Leads
  const lead1Id = await getNextId(LeadModel);
  await LeadModel.create({
    _id: lead1Id,
    agencyId: agency._id,
    widgetId: widget._id,
    name: "Alice Johnson",
    email: "alice@example.com",
    formResponses: {
      name: "Alice Johnson",
      email: "alice@example.com",
      message: "Interested in your services.",
    },
    status: "new",
  });

  const lead2Id = lead1Id + 1;
  await LeadModel.create({
    _id: lead2Id,
    agencyId: agency._id,
    widgetId: widget._id,
    name: "Bob Williams",
    email: "bob@example.com",
    formResponses: {
      name: "Bob Williams",
      email: "bob@example.com",
      message: "Can you send pricing?",
    },
    status: "contacted",
    assignedTo: rep._id,
  });

  console.log("Created leads");

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
