/**
 * Envio de SMS.
 *
 * O fornecedor ainda não está decidido, por isso isto resolve para um
 * **gateway HTTP genérico**: um POST JSON para `SMS_GATEWAY_URL`. Quase todos
 * os fornecedores têm uma API REST, e os que não têm (ou os que não queremos
 * expor) podem ser servidos por um relay como Zapier ou Make, que aceita
 * exactamente este payload.
 *
 * Ligar um fornecedor concreto é uma função de poucos linhas neste ficheiro.
 *
 * Variáveis de ambiente (todas opcionais — sem elas o envio é ignorado e o
 * sistema continua a funcionar, porque a mensagem já está guardada na BD):
 *
 *   SMS_GATEWAY_URL    URL que recebe o POST
 *   SMS_GATEWAY_TOKEN  Bearer token (omitido se vazio)
 *   SMS_FROM           Remetente mostrado ao destinatário
 *   SMS_ADMIN_PHONE    Número do admin, em formato internacional sem "+"
 *                      (ex.: 24595000000)
 */

export type SmsConfig = {
  url: string;
  token: string;
  from: string;
  adminPhone: string;
};

function readConfig(): SmsConfig {
  return {
    url: process.env.SMS_GATEWAY_URL?.trim() ?? "",
    token: process.env.SMS_GATEWAY_TOKEN?.trim() ?? "",
    from: process.env.SMS_FROM?.trim() ?? "",
    adminPhone: process.env.SMS_ADMIN_PHONE?.trim() ?? "",
  };
}

/** `true` quando há configuração suficiente para tentar enviar. */
export function isSmsConfigured(): boolean {
  const { url, adminPhone } = readConfig();
  return url !== "" && adminPhone !== "";
}

export type SmsResult =
  | { sent: true }
  | { sent: false; reason: "not-configured" | "request-failed" };

/**
 * Envia um SMS. Nunca lança: um gateway caído não pode fazer o formulário de
 * contactos falhar, porque a mensagem já foi guardada na base de dados.
 */
export async function sendSms(body: string): Promise<SmsResult> {
  const config = readConfig();

  if (!config.url || !config.adminPhone) {
    console.warn(
      "[sms] SMS_GATEWAY_URL ou SMS_ADMIN_PHONE por definir — aviso de contacto não enviado.",
    );
    return { sent: false, reason: "not-configured" };
  }

  try {
    const response = await fetch(config.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}),
      },
      body: JSON.stringify({
        to: config.adminPhone,
        from: config.from || undefined,
        body,
      }),
      // O gateway não deve segurar o pedido do utilizador em caso de falha.
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.error(`[sms] gateway respondeu ${response.status}`);
      return { sent: false, reason: "request-failed" };
    }

    return { sent: true };
  } catch (error) {
    console.error("[sms] falha ao enviar", error);
    return { sent: false, reason: "request-failed" };
  }
}