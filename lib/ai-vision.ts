/**
 * Leitura de receitas médicas com o Gemini (API externa de visão).
 *
 * O cliente tira uma foto da receita, a imagem é enviada para o servidor do
 * FarmaGo e daqui para a API do Google Gemini, que devolve a lista de
 * medicamentos em JSON. **A imagem nunca é guardada**: só o texto extraído
 * segue para o browser. Guardar a lista de medicamentos é opcional e depende
 * do paciente ter conta e carregar em "guardar".
 *
 * Variáveis de ambiente:
 *
 *   GEMINI_API_KEY   Chave da API do Google AI Studio (obrigatória)
 *   GEMINI_MODEL     Modelo de visão (opcional, padrão "gemini-2.5-flash")
 *
 * Sem `GEMINI_API_KEY` o scanner responde "not-configured" e o resto do site
 * continua a funcionar — o catálogo e a pesquisa por nome não dependem disto.
 */

const API_URL = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_MODEL = "gemini-2.5-flash";
const TIMEOUT_MS = 60_000;

export type ScanResult =
  | { ok: true; medicines: ExtractedMedicine[] }
  | { ok: false; reason: "not-configured" | "request-failed" | "invalid-response" };

/** Medicamento como o Gemini o devolve, antes de ser ligado ao catálogo. */
export type ExtractedMedicine = {
  /** Nome escrito na receita (marca ou genérico). */
  name: string;
  /** Dosagem/apresentação, se estiver escrita (ex.: "500 mg", "xarope 120 ml"). */
  dosage: string | null;
  /** Quantidade de caixas/unidades pedidas; 1 quando a receita não diz. */
  quantity: number;
};

const SYSTEM_PROMPT = [
  "És um assistente que lê receitas médicas fotogTICULADAS.",
  "Extrai ONLY os medicamentos prescritos e devolve EXCLUSIVAMENTE um objeto JSON",
  'no formato {"medicines":[{"name":"...","dosage":"...|null","quantity":1}]}.',
  "Regras:",
  '- "name" é o nome do medicamento como está escrito (marca ou princípio ativo), sem quantidade.',
  '- "dosage" é a dosagem ou apresentação escrita na receita (ex.: "500mg", "xarope 120ml") ou null.',
  '- "quantity" é um inteiro com o número de unidades pedidas; usa 1 se a receita não indicar.',
  "Ignora dados do médico, do paciente, datas, assinaturas e qualquer texto que não seja medicamento.",
  "Se a imagem não for uma receita ou não der para ler, devolve {\"medicines\":[]}.",
  "Nunca inventes medicamentos que não estejas visíveis na imagem.",
].join("\n");

type GeminiPart = { text: string } | { inline_data: { mime_type: string; data: string } };

type GeminiResponse = {
  candidates?: {
    content?: { parts?: { text?: string }[] };
    finishReason?: string;
  }[];
  promptFeedback?: { blockReason?: string };
};

export function isVisionConfigured(): boolean {
  return (process.env.GEMINI_API_KEY?.trim() ?? "") !== "";
}

/**
 * Envia a foto da receita para o Gemini e devolve os medicamentos identificados.
 * Nunca lança exceções: falhas devolvem `ok: false` com o motivo.
 *
 * @param imageBase64 Imagem em base64 puro (sem o prefixo `data:`).
 * @param mimeType    Tipo MIME da imagem (image/jpeg, image/png ou image/webp).
 */
export async function extractMedicinesFromPrescription(
  imageBase64: string,
  mimeType: string
): Promise<ScanResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim() ?? "";
  if (!apiKey) {
    console.warn("[gemini] GEMINI_API_KEY por definir — scanner de receitas desativado.");
    return { ok: false, reason: "not-configured" };
  }

  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;

  const parts: GeminiPart[] = [
    { text: SYSTEM_PROMPT },
    { inline_data: { mime_type: mimeType, data: imageBase64 } },
  ];

  try {
    const response = await fetch(`${API_URL}/models/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error(`[gemini] API respondeu ${response.status}`);
      return { ok: false, reason: "request-failed" };
    }

    const payload = (await response.json()) as GeminiResponse;

    if (payload.promptFeedback?.blockReason) {
      console.error(`[gemini] pedido bloqueado: ${payload.promptFeedback.blockReason}`);
      return { ok: false, reason: "invalid-response" };
    }

    const text = payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();

    if (!text) return { ok: false, reason: "invalid-response" };

    return { ok: true, medicines: parseMedicines(text) };
  } catch (error) {
    console.error("[gemini] falha na chamada", error);
    return { ok: false, reason: "request-failed" };
  }
}

/**
 * O Gemini pode devolver o JSON dentro de um bloco de código ou com texto à
 * volta. Esta função é tolerante: procura o primeiro objeto JSON válido.
 */
export function parseMedicines(text: string): ExtractedMedicine[] {
  const jsonText = extractJsonObject(text);
  if (!jsonText) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return [];
  }

  const record = parsed as { medicines?: unknown };
  if (!Array.isArray(record.medicines)) return [];

  const medicines: ExtractedMedicine[] = [];

  for (const entry of record.medicines) {
    if (typeof entry !== "object" || entry === null) continue;
    const item = entry as Record<string, unknown>;

    const name = typeof item.name === "string" ? item.name.trim() : "";
    if (!name || name.length > 150) continue;

    const dosage =
      typeof item.dosage === "string" && item.dosage.trim() ? item.dosage.trim().slice(0, 50) : null;

    const quantity =
      typeof item.quantity === "number" && Number.isFinite(item.quantity)
        ? Math.min(Math.max(Math.round(item.quantity), 1), 99)
        : 1;

    medicines.push({ name, dosage, quantity });
  }

  return medicines;
}

/** Primeiro objeto JSON equilibrado encontrado no texto (ignora ```json etc.). */
function extractJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < text.length; index++) {
    const char = text[index];

    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }

    if (char === '"') inString = true;
    else if (char === "{") depth++;
    else if (char === "}") {
      depth--;
      if (depth === 0) return text.slice(start, index + 1);
    }
  }

  return null;
}
