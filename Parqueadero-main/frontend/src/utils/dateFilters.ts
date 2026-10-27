/**
 * Utilidades de filtros por fecha compartidas por todos los roles.
 * Los rangos se calculan en la zona horaria del navegador y se envían al
 * backend como fecha/hora ISO (inicio del primer día → fin del último día),
 * así el día final siempre queda incluido.
 */

export type DateFilterMode =
  | 'all'
  | 'today'
  | 'yesterday'
  | 'week'
  | 'last7'
  | 'month'
  | 'last30'
  | 'day'
  | 'range';

export interface DateFilterValue {
  mode: DateFilterMode;
  /** Día específico (YYYY-MM-DD) para el modo 'day' */
  day: string;
  /** Desde (YYYY-MM-DD) para el modo 'range' */
  from: string;
  /** Hasta (YYYY-MM-DD) para el modo 'range' */
  to: string;
}

export interface ResolvedDateRange {
  /** ISO de inicio (00:00:00.000 local) o undefined si no hay filtro */
  dateFrom?: string;
  /** ISO de fin (23:59:59.999 local) o undefined si no hay filtro */
  dateTo?: string;
  /** Primer día del rango (Date local) */
  start?: Date;
  /** Último día del rango (Date local) */
  end?: Date;
  /** Texto legible del filtro aplicado (para pantallas y exportaciones) */
  label: string;
}

export const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export const DATE_FILTER_LABELS: Record<DateFilterMode, string> = {
  all: 'Todo',
  today: 'Hoy',
  yesterday: 'Ayer',
  week: 'Esta semana',
  last7: 'Últimos 7 días',
  month: 'Este mes',
  last30: 'Últimos 30 días',
  day: 'Día específico',
  range: 'Rango de fechas',
};

/** Convierte una fecha a `YYYY-MM-DD` en hora local (formato de <input type="date">). */
export const toInputDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/** Convierte `YYYY-MM-DD` a Date local a las 00:00. */
export const fromInputDate = (value: string): Date | undefined => {
  if (!value) return undefined;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d, 0, 0, 0, 0);
};

const startOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const formatDay = (date: Date) =>
  date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const createDefaultDateFilter = (mode: DateFilterMode = 'all'): DateFilterValue => {
  const today = toInputDate(new Date());
  return { mode, day: today, from: today, to: today };
};

/** Calcula el rango real (inicio/fin) a partir del filtro elegido. */
export const resolveDateRange = (value: DateFilterValue): ResolvedDateRange => {
  const now = new Date();
  let start: Date | undefined;
  let end: Date | undefined;

  switch (value.mode) {
    case 'today':
      start = startOfDay(now);
      end = endOfDay(now);
      break;
    case 'yesterday': {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      start = startOfDay(y);
      end = endOfDay(y);
      break;
    }
    case 'week': {
      // Semana actual de lunes a domingo
      const monday = startOfDay(now);
      const diff = (monday.getDay() + 6) % 7; // 0 = lunes
      monday.setDate(monday.getDate() - diff);
      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 6);
      start = monday;
      end = endOfDay(sunday);
      break;
    }
    case 'last7': {
      const s = startOfDay(now);
      s.setDate(s.getDate() - 6);
      start = s;
      end = endOfDay(now);
      break;
    }
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      end = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));
      break;
    case 'last30': {
      const s = startOfDay(now);
      s.setDate(s.getDate() - 29);
      start = s;
      end = endOfDay(now);
      break;
    }
    case 'day': {
      const d = fromInputDate(value.day);
      if (d) {
        start = startOfDay(d);
        end = endOfDay(d);
      }
      break;
    }
    case 'range': {
      let f = fromInputDate(value.from);
      let t = fromInputDate(value.to);
      // Si el usuario invierte las fechas, se corrigen automáticamente
      if (f && t && f > t) [f, t] = [t, f];
      if (f) start = startOfDay(f);
      if (t) end = endOfDay(t);
      break;
    }
    default:
      break;
  }

  let label = 'Todos los registros (sin filtro de fecha)';
  if (start && end) {
    const sameDay = toInputDate(start) === toInputDate(end);
    label = sameDay
      ? `${DATE_FILTER_LABELS[value.mode]}: ${DIAS_SEMANA[start.getDay()]} ${formatDay(start)}`
      : `${DATE_FILTER_LABELS[value.mode]}: ${formatDay(start)} al ${formatDay(end)}`;
  } else if (start) {
    label = `Desde ${formatDay(start)}`;
  } else if (end) {
    label = `Hasta ${formatDay(end)}`;
  }

  return {
    dateFrom: start ? start.toISOString() : undefined,
    dateTo: end ? end.toISOString() : undefined,
    start,
    end,
    label,
  };
};

export interface DailySummaryRow {
  fecha: string; // YYYY-MM-DD
  fechaTexto: string; // dd/mm/aaaa
  dia: string; // Lunes, Martes...
  cantidad: number;
  total: number;
}

/**
 * Agrupa registros por día (hora local) para el análisis semanal.
 * Si el rango tiene inicio y fin (máx. 62 días) se incluyen también los días sin registros.
 */
export const buildDailySummary = <T,>(
  items: T[],
  getDate: (item: T) => string | Date | null | undefined,
  getValue: (item: T) => number = () => 0,
  range?: ResolvedDateRange,
): DailySummaryRow[] => {
  const map: Record<string, DailySummaryRow> = {};

  const ensure = (d: Date) => {
    const key = toInputDate(d);
    if (!map[key]) {
      map[key] = {
        fecha: key,
        fechaTexto: formatDay(d),
        dia: DIAS_SEMANA[d.getDay()],
        cantidad: 0,
        total: 0,
      };
    }
    return map[key];
  };

  if (range?.start && range?.end) {
    const days = Math.round((startOfDay(range.end).getTime() - range.start.getTime()) / 86400000) + 1;
    if (days > 0 && days <= 62) {
      const cursor = new Date(range.start);
      for (let i = 0; i < days; i++) {
        ensure(cursor);
        cursor.setDate(cursor.getDate() + 1);
      }
    }
  }

  items.forEach((item) => {
    const raw = getDate(item);
    if (!raw) return;
    const d = new Date(raw);
    if (isNaN(d.getTime())) return;
    const row = ensure(d);
    row.cantidad += 1;
    row.total += Number(getValue(item)) || 0;
  });

  return Object.values(map).sort((a, b) => a.fecha.localeCompare(b.fecha));
};

/** Texto de fecha y hora local para tablas y exportaciones. */
export const formatDateTime = (value?: string | Date | null) =>
  value ? new Date(value).toLocaleString('es-CO') : '—';

export const formatDateOnly = (value?: string | Date | null) =>
  value ? new Date(value).toLocaleDateString('es-CO') : '—';

export const formatTimeOnly = (value?: string | Date | null) =>
  value ? new Date(value).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '—';

/** Nombre de archivo seguro con la fecha del filtro. */
export const fileSuffix = (range: ResolvedDateRange) => {
  if (range.start && range.end) {
    const a = toInputDate(range.start);
    const b = toInputDate(range.end);
    return a === b ? a : `${a}_a_${b}`;
  }
  return `completo_${toInputDate(new Date())}`;
};
