export function medicationPlaceholder(name: string): string {
  const letter = (name.trim().charAt(0) || "M").toUpperCase();
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240">` +
    `<rect width="240" height="240" fill="#eafaf0"/>` +
    `<text x="50%" y="54%" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" ` +
    `font-size="96" font-weight="700" fill="#15b312">${letter}</text></svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function pharmacyPlaceholder(name: string): string {
  const letter = (name.trim().charAt(0) || "F").toUpperCase();
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0%" stop-color="#eafaf0"/><stop offset="100%" stop-color="#cfeedd"/>` +
    `</linearGradient></defs>` +
    `<rect width="480" height="320" fill="url(#g)"/>` +
    `<text x="50%" y="56%" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" ` +
    `font-size="120" font-weight="700" fill="#15b312">${letter}</text></svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
