/**
 * Cálculos de data partilhados.
 *
 * Estas funções estão fora dos componentes de propósito: `Date.now()` e
 * `new Date()` são Impure Function Calls e o `react-hooks/purity` não permite
 * chamá-las durante o render. O resultado é sempre calculado no momento em que
 * a função é invocada pelo servidor.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Milissegundos actuais. */
export function nowMs(): number {
  return Date.now();
}

/** Momento actual como Date. */
export function now(): Date {
  return new Date();
}

/** Data que daqui a `days` dias (aceita valores negativos). */
export function dateInDays(days: number): Date {
  return new Date(Date.now() + days * DAY_MS);
}

/** Dias inteiros até `date` (negativo se já passou). */
export function daysUntil(date: Date | string): number {
  const target = typeof date === "string" ? new Date(date).getTime() : date.getTime();
  return Math.ceil((target - Date.now()) / DAY_MS);
}

/** Diferença exacta em dias (fraccionário, para barras de progresso). */
export function exactDaysUntil(date: Date | string): number {
  const target = typeof date === "string" ? new Date(date).getTime() : date.getTime();
  return (target - Date.now()) / DAY_MS;
}

/** Verdadeiro quando a data já passou. */
export function isExpired(date: Date | string): boolean {
  const target = typeof date === "string" ? new Date(date).getTime() : date.getTime();
  return target < Date.now();
}

/** Data no formato `AAAA-MM-DD`, para `<input type="date">`. */
export function toDateInputValue(date: Date | string): string {
  const value = typeof date === "string" ? new Date(date) : date;
  return value.toISOString().slice(0, 10);
}