"use server";

import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n";
import { sendSms } from "@/lib/sms";

export type ContactState = {
  ok: boolean;
  error?: string;
};

const MAX_NAME = 150;
const MAX_EMAIL = 150;
const MAX_PHONE = 30;
const MAX_MESSAGE = 4000;

/** Honeypot: campo invisível que só um bot preencheria. */
const HONEYPOT_FIELD = "website";

function field(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

/**
 * O SMS é curto e vai para o admin (que fala português), por isso só leva o
 * essencial. O texto completo fica no painel de mensagens.
 */
function buildSmsText(input: {
  name: string;
  phone: string | null;
  email: string | null;
  message: string;
}): string {
  const contact = input.phone || input.email || "—";
  return [
    `FarmaGo: nova mensagem de ${input.name} (${contact})`,
    input.message.slice(0, 200),
  ].join("\n");
}

export async function contactAction(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const t = await getT();

  // Bot: devolve sucesso sem gravar nada, para não aprender que o campo existe.
  if (field(formData, HONEYPOT_FIELD) !== "") return { ok: true };

  const name = field(formData, "name");
  const email = field(formData, "email");
  const phone = field(formData, "phone");
  const subject = field(formData, "subject");
  const message = field(formData, "message");

  if (!name) return { ok: false, error: t("contact.errorName") };
  if (!message) return { ok: false, error: t("contact.errorMessage") };

  if (name.length > MAX_NAME) return { ok: false, error: t("contact.errorTooLong") };
  if (message.length > MAX_MESSAGE) return { ok: false, error: t("contact.errorTooLong") };

  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    return { ok: false, error: t("contact.errorEmail") };
  }

  const saved = await prisma.contactMessage.create({
    data: {
      name: name.slice(0, MAX_NAME),
      email: email ? email.slice(0, MAX_EMAIL) : null,
      phone: phone ? phone.slice(0, MAX_PHONE) : null,
      subject: subject ? subject.slice(0, MAX_NAME) : null,
      message,
    },
  });

  // O SMS é best-effort: a mensagem já está guardada, uma falha do gateway
  // não pode fazer o formulário devolver erro ao utilizador.
  await sendSms(
    buildSmsText({ name: saved.name, phone: saved.phone, email: saved.email, message }),
  );

  return { ok: true };
}