import "dotenv/config";
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaMariaDb({
  host:            process.env.DATABASE_HOST     ?? "localhost",
  port:            Number(process.env.DATABASE_PORT ?? 3306),
  user:            process.env.DATABASE_USER     ?? "root",
  password:        process.env.DATABASE_PASSWORD ?? "",
  database:        process.env.DATABASE_NAME     ?? "farmago",
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

const scryptAsync = promisify(scrypt);
const SCRYPT_KEYLEN = 64;

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, SCRYPT_KEYLEN)) as Buffer;
  // Mesmo formato de lib/auth.ts: scrypt:<sal>:<hash>
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

// Password usada em todas as contas de demonstração (definível por env).
const SEED_PASSWORD = process.env.SEED_PASSWORD ?? "farmago123";

async function main() {
  // Limpar tudo (sessões em cascata)
  await prisma.session.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.pharmacyStock.deleteMany();
  await prisma.medication.deleteMany();
  await prisma.pharmacy.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hashPassword(SEED_PASSWORD);

  // --- Administrador (valida as farmácias) ---
  const admin = await prisma.user.create({
    data: {
      name:        "Administrador",
      email:       "admin@farmago.com",
      passwordHash,
      role:        "admin",
      createdAt:   new Date("2026-01-05T09:00:00Z"),
    },
  });

  // --- Inspeção (regula os plantões das farmácias) ---
  await prisma.user.create({
    data: {
      name:        "Inspeção Farmacêutica",
      email:       "inspecao@farmago.com",
      passwordHash,
      role:        "inspecao",
      createdAt:   new Date("2026-01-05T09:00:00Z"),
    },
  });

  // --- Medicamentos ---
  const [panadol, doliprane, antidol, smectalia, imodium, hydroxyd, amoxil, brufen] =
    await Promise.all([
      prisma.medication.create({ data: { name: "Panadol",   dosage: "500mg",  description: "Analgésico e antipirético à base de paracetamol.", needsPrescription: false } }),
      prisma.medication.create({ data: { name: "Doliprane", dosage: "1000mg", description: "Comprimido efervescente com paracetamol.", needsPrescription: false } }),
      prisma.medication.create({ data: { name: "Antidol",   dosage: "500mg",  description: "Analgésico de ação rápida.", needsPrescription: false } }),
      prisma.medication.create({ data: { name: "Smectalia", dosage: "3g",     description: "Tratamento da diarreia aguda.", needsPrescription: false } }),
      prisma.medication.create({ data: { name: "Imodium",   dosage: "2mg",    description: "Controlo de diarreia.", needsPrescription: false } }),
      prisma.medication.create({ data: { name: "Hydroxyd",  dosage: "500mg",  description: "Anti-histamínico para alergias.", needsPrescription: false } }),
      prisma.medication.create({ data: { name: "Amoxil",    dosage: "250mg",  description: "Antibiótico de largo espetro.", needsPrescription: true } }),
      prisma.medication.create({ data: { name: "Brufen",    dosage: "400mg",  description: "Anti-inflamatório não esteroide.", needsPrescription: false } }),
    ]);

  // --- Farmácias ---
  // Regra do sistema: uma farmácia por conta de farmacêutico.
  // Cada entrada declara o seu proprietário, que é criado aqui.
  const pharmaciesData = [
    { owner: { name: "Carlos Silva",    email: "carlos@farmago.com" },  name: "Farmácia A. Combatentes", image: "/images/img6.jpg",  address: "Avenida dos Combatentes da Liberdade da Pátria, Bissau", phone: "+245955000001", schedule: "Segunda - Sexta", hours: "09:00 - 23:00", latitude: 11.8625, longitude: -15.582, isGuard: false, validated: true,
      stocks: [
        { medicationId: panadol.id,   quantity: 50, expiryDate: new Date("2027-06-01"), batchNumber: "L001" },
        { medicationId: doliprane.id, quantity: 30, expiryDate: new Date("2026-12-31"), batchNumber: "L002" },
        { medicationId: antidol.id,   quantity: 20, expiryDate: new Date("2026-09-15"), batchNumber: "L003" },
      ],
      expenses: [
        { title: "Renda",        category: "infraestrutura" as const, amount: 1500.0, expenseDate: new Date("2026-06-01") },
        { title: "Salários",     category: "pessoal"        as const, amount: 4500.0, expenseDate: new Date("2026-06-01") },
        { title: "Compra stock", category: "stock"          as const, amount: 2000.0, expenseDate: new Date("2026-06-05") },
      ],
    },
    { owner: { name: "Ana Gomes",       email: "ana@farmago.com" },     name: "Farmácia Mocambique", image: "/images/img7.jpg", address: "Bairro de Moçambique, Bissau", phone: "+245955000002", schedule: "Segunda - Sexta", hours: "09:00 - 23:00", latitude: 11.854, longitude: -15.593, isGuard: false, validated: true,
      stocks: [
        { medicationId: panadol.id,   quantity: 40, expiryDate: new Date("2027-03-01"), batchNumber: "L010" },
        { medicationId: smectalia.id, quantity: 15, expiryDate: new Date("2026-08-20"), batchNumber: "L011" },
        { medicationId: amoxil.id,    quantity: 25, expiryDate: new Date("2026-11-10"), batchNumber: "L012" },
      ],
      expenses: [
        { title: "Electricidade", category: "infraestrutura" as const, amount: 300.0, expenseDate: new Date("2026-06-01") },
        { title: "Salários",      category: "pessoal"        as const, amount: 3000.0, expenseDate: new Date("2026-06-01") },
      ],
    },
    { owner: { name: "Bruno Tavares",   email: "bruno@farmago.com" },   name: "Farmácia N. Mandela", image: "/images/img5.jpg", address: "Avenida Nelson Mandela, Bissau", phone: "+245955000003", schedule: "Segunda - Sexta", hours: "09:00 - 23:00", latitude: 11.874, longitude: -15.589, isGuard: false, validated: true,
      stocks: [
        { medicationId: antidol.id, quantity: 60, expiryDate: new Date("2027-01-15"), batchNumber: "L020" },
        { medicationId: imodium.id, quantity: 20, expiryDate: new Date("2026-07-30"), batchNumber: "L021" },
        { medicationId: brufen.id,  quantity: 35, expiryDate: new Date("2027-04-01"), batchNumber: "L022" },
      ],
      expenses: [
        { title: "Renda",    category: "infraestrutura" as const, amount: 1200.0, expenseDate: new Date("2026-06-01") },
        { title: "Salários", category: "pessoal"        as const, amount: 3500.0, expenseDate: new Date("2026-06-01") },
      ],
    },
    { owner: { name: "Sónia Mendes",    email: "sonia@farmago.com" },   name: "Farmácia Takir", image: "/images/img9.jpg", address: "Bairro de Takir, Bissau", phone: "+245955000004", schedule: "Segunda - Sexta", hours: "09:00 - 23:00", latitude: 11.829, longitude: -15.617, isGuard: false, validated: false,
      stocks: [
        { medicationId: doliprane.id, quantity: 45, expiryDate: new Date("2027-02-28"), batchNumber: "L030" },
        { medicationId: hydroxyd.id,  quantity: 10, expiryDate: new Date("2026-06-25"), batchNumber: "L031" },
      ],
      expenses: [
        { title: "Água e luz", category: "infraestrutura" as const, amount: 250.0, expenseDate: new Date("2026-06-01") },
      ],
    },
    { owner: { name: "Nuno Cardoso",   email: "nuno@farmago.com" },    name: "Farmácia Ociano", image: "/images/img10.jpg", address: "Bairro Central, Avenida Amílcar Cabral, Bissau", phone: "+245955000005", schedule: "Segunda - Sexta", hours: "09:00 - 23:00", latitude: 11.863, longitude: -15.596, isGuard: false, validated: true,
      stocks: [
        { medicationId: panadol.id,  quantity: 80, expiryDate: new Date("2027-05-01"), batchNumber: "L040" },
        { medicationId: imodium.id,  quantity: 25, expiryDate: new Date("2026-10-15"), batchNumber: "L041" },
        { medicationId: hydroxyd.id, quantity: 15, expiryDate: new Date("2026-09-01"), batchNumber: "L042" },
      ],
      expenses: [
        { title: "Renda",    category: "infraestrutura" as const, amount: 2000.0, expenseDate: new Date("2026-06-01") },
        { title: "Salários", category: "pessoal"        as const, amount: 5000.0, expenseDate: new Date("2026-06-01") },
      ],
    },
    // Farmácias de plantão
    { owner: { name: "Marta Pires",     email: "marta@farmago.com" },   name: "Farmacia Ociano (Plantão)",     image: "/images/img2.jpg", address: "Bairro Central, Avenida Amílcar Cabral, Bissau", phone: "+245955000010", schedule: "Segunda - Domingo", hours: "08:00 - 22:00", latitude: 11.8632, longitude: -15.5958, isGuard: true, validated: true,
      stocks: [
        { medicationId: panadol.id,   quantity: 30, expiryDate: new Date("2027-01-01"), batchNumber: "G001" },
        { medicationId: doliprane.id, quantity: 20, expiryDate: new Date("2026-11-01"), batchNumber: "G002" },
      ],
      expenses: [],
    },
    { owner: { name: "Rui Ferreira",    email: "rui@farmago.com" },     name: "Farmacia Mocambique (Plantão)", image: "/images/img3.jpg", address: "Bairro de Moçambique, Bissau",                    phone: "+245955000011", schedule: "Segunda - Domingo", hours: "08:00 - 22:00", latitude: 11.8542, longitude: -15.5928, isGuard: true, validated: true,
      stocks: [
        { medicationId: panadol.id,  quantity: 25, expiryDate: new Date("2026-12-01"), batchNumber: "G010" },
        { medicationId: antidol.id,  quantity: 15, expiryDate: new Date("2026-08-01"), batchNumber: "G011" },
      ],
      expenses: [],
    },
    { owner: { name: "Clara Lopes",     email: "clara@farmago.com" },    name: "Farmacia Quilele",              image: "/images/img4.jpg", address: "Bairro de Quilele, Estrada Principal, Bissau",    phone: "+245955000012", schedule: "Segunda - Domingo", hours: "08:00 - 22:00", latitude: 11.833, longitude: -15.606, isGuard: true, validated: true,
      stocks: [
        { medicationId: doliprane.id, quantity: 20, expiryDate: new Date("2027-03-01"), batchNumber: "G020" },
        { medicationId: smectalia.id, quantity: 10, expiryDate: new Date("2026-07-01"), batchNumber: "G021" },
      ],
      expenses: [],
    },
    { owner: { name: "Pauloindicente",  email: "paulo@farmago.com" },    name: "Farmacia N. Mandela (Plantão)", image: "/images/img8.jpg", address: "Avenida Nelson Mandela, Bissau",                  phone: "+245955000013", schedule: "Segunda - Domingo", hours: "08:00 - 22:00", latitude: 11.8738, longitude: -15.5892, isGuard: true, validated: false,
      stocks: [
        { medicationId: antidol.id, quantity: 35, expiryDate: new Date("2027-02-01"), batchNumber: "G030" },
        { medicationId: imodium.id, quantity: 12, expiryDate: new Date("2026-06-20"), batchNumber: "G031" },
      ],
      expenses: [],
    },
    { owner: { name: "Helena Castro",   email: "helena@farmago.com" },   name: "Farmácia Central de Bissau",    image: "/images/img5.jpg", address: "Bairro Central, Avenida Amílcar Cabral, Bissau",  phone: "+245955000014", schedule: "Segunda - Domingo", hours: "08:00 - 22:00", latitude: 11.864, longitude: -15.5975, isGuard: true, validated: true,
      stocks: [
        { medicationId: panadol.id,   quantity: 100, expiryDate: new Date("2027-06-01"), batchNumber: "G040" },
        { medicationId: doliprane.id, quantity: 80,  expiryDate: new Date("2027-01-01"), batchNumber: "G041" },
        { medicationId: antidol.id,   quantity: 60,  expiryDate: new Date("2026-12-01"), batchNumber: "G042" },
        { medicationId: smectalia.id, quantity: 40,  expiryDate: new Date("2026-09-01"), batchNumber: "G043" },
        { medicationId: imodium.id,   quantity: 50,  expiryDate: new Date("2026-10-01"), batchNumber: "G044" },
        { medicationId: hydroxyd.id,  quantity: 30,  expiryDate: new Date("2026-11-01"), batchNumber: "G045" },
      ],
      expenses: [],
    },
    { owner: { name: "Rui Sanhá",       email: "rui.sanha@farmago.com" }, name: "Farmacia Saude",                image: "/images/img6.jpg", address: "Bairro de Belém, Bissau",                         phone: "+245955000015", schedule: "Segunda - Domingo", hours: "08:00 - 22:00", latitude: 11.869, longitude: -15.595, isGuard: true, validated: true,
      stocks: [
        { medicationId: panadol.id,  quantity: 40, expiryDate: new Date("2027-04-01"), batchNumber: "G050" },
        { medicationId: hydroxyd.id, quantity: 20, expiryDate: new Date("2026-08-15"), batchNumber: "G051" },
      ],
      expenses: [],
    },
  ];

  for (const p of pharmaciesData) {
    // Um proprietário novo por farmácia (regra: 1 conta = 1 farmácia).
    const owner = await prisma.user.create({
      data: {
        name:        p.owner.name,
        email:       p.owner.email,
        passwordHash,
        role:        "owner",
        createdAt:   new Date("2026-02-10T10:00:00Z"),
      },
    });

    await prisma.pharmacy.create({
      data: {
        ownerId:  owner.id,
        name:     p.name,
        image:    p.image,
        address:  p.address,
        phone:    p.phone,
        schedule: p.schedule,
        hours:    p.hours,
        latitude: p.latitude,
        longitude: p.longitude,
        isGuard:  p.isGuard,
        status:   p.validated ? "approved" : "pending",
        validatedAt:   p.validated ? new Date("2026-02-20T09:30:00Z") : null,
        validatedById: p.validated ? admin.id : null,
        stocks: {
          create: p.stocks.map((s) => ({
            medicationId: s.medicationId,
            quantity:     s.quantity,
            expiryDate:   s.expiryDate,
            batchNumber:  s.batchNumber,
          })),
        },
        expenses: {
          create: p.expenses.map((e) => ({
            title:       e.title,
            category:    e.category,
            amount:      e.amount,
            expenseDate: e.expenseDate,
          })),
        },
      },
    });
  }

  const pending = await prisma.pharmacy.count({ where: { status: "pending" } });

  console.log(`✅ Seed concluído:`);
  console.log(`   - ${await prisma.user.count()} utilizadores`);
  console.log(`   - ${await prisma.medication.count()} medicamentos`);
  console.log(`   - ${await prisma.pharmacy.count()} farmácias (${pending} por validar)`);
  console.log(`   - ${await prisma.pharmacyStock.count()} entradas de stock`);
  console.log(`   - ${await prisma.expense.count()} despesas`);
  console.log(`\n🔑 Password de todas as contas: ${SEED_PASSWORD}`);
  console.log(`   admin@farmago.com (admin) — farmácias por validar: /admin/validations`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
