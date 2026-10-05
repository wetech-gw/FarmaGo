import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const imageDir = path.join(process.cwd(), "public", "images", "pharmacies");
const contentTypes = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
  [".avif", "image/avif"],
]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  const contentType = contentTypes.get(path.extname(filename).toLowerCase());

  if (!contentType || path.basename(filename) !== filename) {
    return new Response(null, { status: 404 });
  }

  try {
    const image = await readFile(path.join(imageDir, filename));
    return new Response(new Uint8Array(image), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
