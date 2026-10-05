import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST ?? "localhost",
  port: Number(process.env.DATABASE_PORT ?? 3306),
  user: process.env.DATABASE_USER ?? "root",
  password: process.env.DATABASE_PASSWORD ?? "",
  database: process.env.DATABASE_NAME ?? "farmago_db",
  connectionLimit: 2,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const rows = await prisma.pharmacy.groupBy({ by: ["ownerId"], _count: { _all: true } });
  console.log(
    "ownerId -> n farmacias:",
    JSON.stringify(rows.map((r) => ({ ownerId: r.ownerId, n: r._count._all }))),
  );

  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, passwordHash: true },
  });
  console.log(
    "utilizadores:",
    JSON.stringify(
      users.map((u) => ({ id: u.id, email: u.email, role: u.role, hash: u.passwordHash.slice(0, 14) })),
      null,
      1,
    ),
  );

  const statuses = await prisma.pharmacy.groupBy({ by: ["status"], _count: { _all: true } });
  console.log("status:", JSON.stringify(statuses));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
