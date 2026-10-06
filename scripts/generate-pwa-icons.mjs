/**
 * Gera os ícones PWA a partir de `public/images/Logo.png`.
 *
 * O logo é um wordmark largo (475×310): uma marca (nuvem + cruz + gráfico) na
 * parte de cima e o texto "FarmaGo" por baixo. Para os ícones de aplicação só
 * interessa a marca, por isso é recortada (caixa medida em x 116–357, y 28–182)
 * e centrada numa moldura quadrada.
 *
 * O fundo é branco em todas as variantes, incluindo as *maskable*: a marca é
 * feita de contornos verdes/teal sobre branco, por isso um fundo verde
 * deixaria só o contorno e o interior branco desaparecia.
 *
 * Uso: npm run pwa:icons
 */

import { mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const root = process.cwd();
const source = path.join(root, "public", "images", "Logo.png");
const iconsDir = path.join(root, "public", "icons");

/** Recorte da marca dentro do logo original (475×310), com 8px de margem. */
const MARK_CROP = { left: 108, top: 20, width: 258, height: 170 };

/** Fundo branco. iOS não compõe transparência em `apple-touch-icon`. */
const BACKGROUND = "#ffffff";

const mark = await sharp(source).extract(MARK_CROP).png().toBuffer();

/**
 * `safe` é a fração do lado do ícone que a marca ocupa.
 *
 * Nos ícones maskable o Android recorta a imagem para um círculo que cobre
 * ~80% do lado, por isso a marca é reduzida para ficar dentro da zona segura.
 */
async function icon(size, safe, target) {
  const scaled = await sharp(mark)
    .resize(Math.round(size * safe), Math.round(size * safe), { fit: "inside" })
    .png()
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: BACKGROUND },
  })
    .composite([{ input: scaled, gravity: "centre" }])
    .png({ compressionLevel: 9 })
    .toFile(target);

  console.log(`✓ ${path.relative(root, target)} (${size}×${size})`);
}

await mkdir(iconsDir, { recursive: true });

await icon(192, 0.82, path.join(iconsDir, "icon-192.png"));
await icon(512, 0.82, path.join(iconsDir, "icon-512.png"));
await icon(180, 0.82, path.join(root, "app", "apple-icon.png"));
await icon(192, 0.56, path.join(iconsDir, "icon-maskable-192.png"));
await icon(512, 0.56, path.join(iconsDir, "icon-maskable-512.png"));