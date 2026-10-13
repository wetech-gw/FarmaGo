import { NextRequest } from "next/server";
import { extractMedicinesFromPrescription } from "@/lib/ai-vision";

/**
 * POST /api/scan-receita
 *
 * Recebe a foto da receita em base64, chama o Gemini e devolve os
 * medicamentos identificados. A imagem não é guardada — só o texto extraído
 * volta para o browser.
 *
 * Corpo: { "image": "<base64 puro>", "mimeType": "image/jpeg" }
 * Respostas:
 *   200 { medicines: [{ name, dosage, quantity }] }
 *   400 imagem em falta ou tipo/tamanho inválido
 *   429 demasiados pedidos do mesmo IP (protege a chave paga da API)
 *   503 GEMINI_API_KEY não configurada
 *   502 falha na chamada ao Gemini
 */

export const dynamic = "force-dynamic";

const MAX_BASE64_BYTES = 4 * 1024 * 1024; // ~3 MB de imagem
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Rate limit simples em memória: N pedidos por janela, por IP.
// Num único servidor node (output: standalone) é suficiente; com várias
// instâncias atrás de um balanceador, trocar por Redis.
const RATE_LIMIT = { max: 10, windowMs: 60 * 60 * 1000 };
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT.max;
}

function clientKey(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: NextRequest) {
  if (rateLimited(clientKey(request))) {
    return Response.json({ error: "rate-limited" }, { status: 429 });
  }

  let body: { image?: unknown; mimeType?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid-json" }, { status: 400 });
  }

  const image = typeof body.image === "string" ? body.image : "";
  const mimeType = typeof body.mimeType === "string" ? body.mimeType : "";

  if (!image) return Response.json({ error: "image-required" }, { status: 400 });
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return Response.json({ error: "unsupported-type" }, { status: 400 });
  }
  if (image.length > MAX_BASE64_BYTES) {
    return Response.json({ error: "image-too-large" }, { status: 400 });
  }

  const result = await extractMedicinesFromPrescription(image, mimeType);

  if (!result.ok) {
    const status = result.reason === "not-configured" ? 503 : 502;
    return Response.json({ error: result.reason }, { status });
  }

  return Response.json({ medicines: result.medicines });
}
