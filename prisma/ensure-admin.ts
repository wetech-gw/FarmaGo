/**
 * Garante que existe uma conta admin pronta a iniciar sessão.
 *
 * Ao contrário de `seed.ts` (que apaga tudo), este script é idempotente e
 * não destrutivo: cria a conta se não existir, ou repõe apenas a password e
 * o role se já existir. As farmácias, medicamentos, stock e despesas ficam
 * intactos.
 *
 * Lê a ligação do `DATABASE_URL` (formato habitual dos hostings) e, em
 * alternativa, das variáveis `DATABASE_HOST`/`DATABASE_PORT`/... tal como
 * `set-password.ts` faz.
 *
 * Uso:
 *   npx tsx prisma/ensure-admin.ts
 *   ADMIN_PASSWORD="a-minha-password" npx tsx prisma/ensure-admin.ts
 *   ADMIN_EMAIL="eu@exemplo.com" ADMIN_PASSWORD="..." npx tsx prisma/ensure-admin.ts
 *
 * A password vem de `ADMIN_PASSWORD` ou do primeiro argumento posicional
 * (o email é o segundo e só opcional).
 */
import "dotenv/config";
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

/** Mesmos parâmetros de `lib/auth.ts`, para o hash ser aceite no login. */
const SCRYPT_KEYLEN = 64;

const prisma = new PrismaClient({ adapter: buildAdapter() });

function buildAdapter() {
  const url = process.env.DATABASE_URL;

  if (url) {
    const parsed = new URL(url);
    return new PrismaMariaDb({
      host: decodeURIComponent(parsed.hostname),
      port: Number(parsed.port || 3306),
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace(/^\//, ""),
      connectionLimit: 2,
    });
  }

  return new PrismaMariaDb({
    host: process.env.DATABASE_HOST ?? "localhost",
    port: Number(process.env.DATABASE_PORT ?? 3306),
    user: process.env.DATABASE_USER ?? "root",
    password: process.env.DATABASE_PASSWORD ?? "",
    database: process.env.DATABASE_NAME ?? "farmago_db",
    connectionLimit: 2,
  });
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, SCRYPT_KEYLEN)) as Buffer;
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

async function main() {
  const [passwordArg, emailArg] = process.argv.slice(2);

  const email = (emailArg ?? process.env.ADMIN_EMAIL ?? "admin@farmago.com").trim().toLowerCase();
  const password = passwordArg ?? process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Administrador";

  if (!password) {
    console.error(
      "Indica a password: ADMIN_PASSWORD=\"...\" npx tsx prisma/ensure-admin.ts",
    );
    process.exit(1);
  }

  if (password.length < 6) {
    console.error("A palavra-passe deve ter pelo menos 6 caracteres.");
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  const existing = await prisma.user.findUnique({ where: { email } });

  let action: string;
  let userId: number;

  if (existing) {
    const user = await prisma.user.update({
      where: { id: existing.id },
      data: { passwordHash, role: "admin" },
    });
    action = existing.role === "admin" ? "password reposta" : "password reposta + role alterado para admin";
    userId = user.id;
  } else {
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: "admin" },
    });
    action = "conta criada";
    userId = user.id;
  }

  // Sessões antigas caem: a password mudou, forçamos login novo.
  const { count } = await prisma.session.deleteMany({ where: { userId } });

  console.log(`  ✓ ${email} (admin) — ${action}`);
  console.log(`  ↳ ${count} sessão(ões) limpa(s)`);
  console.log(`\n🔑 Entra em /login e a role "admin" leva a /admin/dashboard`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());