import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { getT } from "@/lib/i18n";

const medicationImageDir = path.join(process.cwd(), "public", "images", "medications");

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

async function saveUploadedImage(file: File | null, t: Awaited<ReturnType<typeof getT>>): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(t("error.unsupportedImageFormat"));
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(t("error.imageTooLarge"));
  }

  await fs.mkdir(medicationImageDir, { recursive: true });

  const extension = path.extname(file.name) || ".jpg";
  const filename = `${Date.now()}-${randomUUID()}${extension}`;

  await fs.writeFile(path.join(medicationImageDir, filename), Buffer.from(await file.arrayBuffer()));

  return `/images/medications/${filename}`;
}

/**
 * Resolve a imagem do formulário partilhado: upload tem prioridade, depois a
 * URL escrita à mão, e na edição mantém-se a imagem existente.
 */
export async function resolveMedicationImage(
  formData: FormData,
  currentImage?: string | null
): Promise<string | null> {
  const t = await getT();
  const uploaded = await saveUploadedImage(formData.get("imageFile") as File | null, t);
  if (uploaded) return uploaded;

  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  return imageUrl || currentImage || null;
}
