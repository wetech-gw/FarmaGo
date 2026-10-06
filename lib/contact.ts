/**
 * Dados de contacto da FarmaGo.
 *
 * Fica num único sítio porque o número é usado em vários pontos (rodapé,
 * página de contactos, botão flutuante do WhatsApp) e é fácil divergirem.
 *
 * ⚠️ `phone` é um número de demonstração herdado do template. Substituir pelo
 * número real do WhatsApp da FarmaGo — é a única alteração necessária para o
 * botão funcionar em todo o lado.
 */
export const CONTACT = {
  /** Número como é mostrado ao utilizador. Fonte única de verdade. */
  phone: "+245 95 793 33 33",
  email: "contact@wetechgroupe.com",
} as const;

/** O mesmo número só com dígitos, como o `wa.me` exige (sem `+` nem espaços). */
export const CONTACT_DIGITS = CONTACT.phone.replace(/\D/g, "");

/** Ligação directa. */
export const telHref = `tel:${CONTACT.phone.replace(/\s/g, "")}`;

/**
 * Liga à conversa de WhatsApp com uma mensagem já escrita.
 * `wa.me` abre a conversa em Android/iOS/Desktop.
 */
export function whatsappHref(message: string): string {
  return `https://wa.me/${CONTACT_DIGITS}?text=${encodeURIComponent(message)}`;
}
