/**
 * Define (ou repõe) a palavra-passe de contas existentes.
 *
 * As contas criadas antes da migração para `password_hash` ficaram com um
 * valor placeholder e não conseguem iniciar sessão. Este script regista
 * passwords scrypt válidas sem alterar o estado das farmácias.
 *
 * Uso:
 *   npx tsx prisma/set-password.ts
 *   npx tsx prisma/set-password.ts "admin@farmago.gw" "nova-password"
 *
 * Sem argumentos, aplica a password de SEED_PASSWORD a todas as contas.
 */
import "dotenv/config";
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
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
const scryptAsync = promisify(scrypt);
const SCRYPT_KEYLEN = 64;

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, SCRYPT_KEYLEN)) as Buffer;
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

async function main() {
  const [emailArg, passwordArg] = process.argv.slice(2);
  const password = passwordArg ?? process.env.SEED_PASSWORD ?? "farmago123";

  if (password.length < 6) {
    console.error("A palavra-passe deve ter pelo menos 6 caracteres.");
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);

  const users = emailArg
    ? await prisma.user.findMany({ where: { email: emailArg.trim().toLowerCase() } })
    : await prisma.user.findMany();

  if (users.length === 0) {
    console.error(emailArg ? `Nenhuma conta com o email ${emailArg}.` : "Não há contas na base de dados.");
    process.exit(1);
  }

  // Limpa sessões para forçar novo login com a password nova.
  await prisma.session.deleteMany();

  for (const user of users) {
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    console.log(`  ✓ ${user.email} (${user.role})`);
  }

  console.log(`\n🔑 Password definida para ${users.length} conta(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
