/**
 * Utilidades de rango de fechas para los filtros de consulta y exportación.
 *
 * Acepta dos formatos en los query params `dateFrom` / `dateTo`:
 *  - Fecha simple `YYYY-MM-DD`  → se interpreta como el día completo en hora local
 *    (desde las 00:00:00.000 hasta las 23:59:59.999), de modo que el día final
 *    SÍ queda incluido en el resultado.
 *  - Fecha/hora ISO completa (ej: 2026-10-26T05:00:00.000Z) → se usa tal cual.
 *    El frontend envía este formato ya calculado con la zona horaria del navegador.
 */
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

const toValidDate = (value: string): Date | undefined => {
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
};

export function parseStartDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const v = value.trim();
  return toValidDate(DATE_ONLY.test(v) ? `${v}T00:00:00.000` : v);
}

export function parseEndDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const v = value.trim();
  return toValidDate(DATE_ONLY.test(v) ? `${v}T23:59:59.999` : v);
}

/** Devuelve el objeto `{ gte, lte }` para Prisma o `undefined` si no hay filtro. */
export function buildDateRange(dateFrom?: string, dateTo?: string): { gte?: Date; lte?: Date } | undefined {
  const gte = parseStartDate(dateFrom);
  const lte = parseEndDate(dateTo);
  if (!gte && !lte) return undefined;
  const range: { gte?: Date; lte?: Date } = {};
  if (gte) range.gte = gte;
  if (lte) range.lte = lte;
  return range;
}

/** Clave de día local `YYYY-MM-DD` para agrupar registros por fecha. */
export function toDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
