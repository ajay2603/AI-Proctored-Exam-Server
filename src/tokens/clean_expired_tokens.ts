import * as cron from 'node-cron';
import { PrismaClient } from "@prisma/client";

// Initialize Prisma client
const prisma = new PrismaClient();

// Schedule a cleanup task to run every 12 hours
cron.schedule("0 */12 * * *", async () => {
  console.log("Running token cleanup task...");

  try {
    // Delete tokens that are older than 1 day (24 hours)
    const deleted = await prisma.validToken.deleteMany({
      where: {
        createdAt: {
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Tokens older than 1 day (24 hours)
        },
      },
    });

    console.log(`Deleted ${deleted.count} expired tokens.`);
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
});

// No need to call cron.start(), it will start automatically after scheduling
