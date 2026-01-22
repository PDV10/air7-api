import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create Prisma connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  console.log("🔐 Creating admin user...\n");

  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    console.error("❌ ADMIN_PASSWORD environment variable is required");
    console.log("Usage: ADMIN_PASSWORD=yourpassword yarn seed:admin");
    process.exit(1);
  }

  // Hash password with bcrypt (10 rounds)
  const hashedPassword = await bcrypt.hash(password, 10);

  // Upsert admin (create or update)
  const admin = await prisma.admin.upsert({
    where: { username },
    update: { password: hashedPassword },
    create: {
      username,
      password: hashedPassword,
    },
  });

  console.log("✅ Admin user created/updated successfully");
  console.log(`   Username: ${admin.username}`);
  console.log(`   ID: ${admin.id}`);
}

main()
  .catch((e) => {
    console.error("❌ Error creating admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
