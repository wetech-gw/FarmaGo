import type * as Leaflet from "leaflet";

type LeafletCandidate = Record<string, unknown> | undefined | null;

/**
 * O pacote `leaflet` só expõe `main` (UMD/CJS), sem `module` nem `exports`.
 * Consoante o bundler (Turbopack/webpack), o `import()` pode devolver a API
 * em `default`, nos *named exports*, ou em ambos — por isso validamos antes
 * de usar, em vez de assumir a forma do módulo.
 */
export async function loadLeaflet(): Promise<typeof Leaflet> {
  const mod = (await import("leaflet")) as unknown as LeafletCandidate;

  const candidates: LeafletCandidate[] = [
    (mod as { default?: LeafletCandidate })?.default,
    mod,
  ];

  for (const candidate of candidates) {
    if (candidate && typeof candidate.map === "function" && typeof candidate.tileLayer === "function") {
      return candidate as unknown as typeof Leaflet;
    }
  }

  throw new Error("Não foi possível carregar o Leaflet.");
}