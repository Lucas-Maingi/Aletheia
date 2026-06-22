const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Starting duplicates cleanup in the evidence table...");
  try {
    // Find all evidence records
    const allEvidence = await prisma.evidence.findMany({
      select: {
        id: true,
        investigationId: true,
        provenanceHash: true,
      }
    });

    console.log(`Found ${allEvidence.length} total evidence records.`);

    // Find duplicates (where both investigationId and provenanceHash are identical, and provenanceHash is not null/empty)
    const seen = new Set();
    const duplicates = [];

    for (const item of allEvidence) {
      if (!item.provenanceHash) continue; // Skip items without hashes
      const key = `${item.investigationId}_${item.provenanceHash}`;
      if (seen.has(key)) {
        duplicates.push(item.id);
      } else {
        seen.add(key);
      }
    }

    console.log(`Found ${duplicates.length} duplicate evidence records to delete.`);

    if (duplicates.length > 0) {
      const deleteResult = await prisma.evidence.deleteMany({
        where: {
          id: {
            in: duplicates
          }
        }
      });
      console.log(`Deleted ${deleteResult.count} duplicate records successfully!`);
    } else {
      console.log("No duplicates found.");
    }
  } catch (error) {
    console.error("Error cleaning up duplicates:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
