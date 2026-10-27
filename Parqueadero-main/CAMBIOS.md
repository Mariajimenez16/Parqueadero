# Mejoras: filtros por rol, fechas/día y exportación

No se tocó nada más: el login, las rutas, el Sidebar, el AuthContext, la base de datos, el schema de Prisma y el Dashboard quedan **exactamente igual**. No hay que instalar librerías nuevas, porque se usan las que ya tenía el proyecto (`jspdf`, `jspdf-autotable`, `xlsx`).

Cómo aplicarlo: copie la carpeta `Parqueadero-main` de `Parqueadero-solo-cambios.zip` sobre su proyecto y acepte reemplazar. Son 9 archivos nuevos y 11 modificados. Después reinicie el backend (`npm run start:dev`) y el frontend (`npm run dev`).

---

## BACKEND

### NUEVO: `backend/src/common/utils/date-range.util.ts`
Contiene `buildDateRange(dateFrom, dateTo)`, que arma el filtro `{ gte, lte }` de Prisma.
- Arregla un error que tenía el proyecto: antes `new Date('2026-10-26')` como "hasta" **dejaba por fuera el último día**. Ahora ese día queda incluido completo (00:00 a 23:59:59).
- Acepta tanto `YYYY-MM-DD` como fechas ISO completas.

### `movements/movements.service.ts`
- `getHistory`: usa `buildDateRange` sobre `entryTime`.
- Sin filtro de fechas se mantiene el `take: 200` de antes. Con un rango se trae el período completo, para que el análisis semanal no quede cortado.

### `payments/payments.controller.ts` + `payments.service.ts`
- `GET /payments/pending` ahora acepta `dateFrom` y `dateTo`, y filtra por la fecha en que se generó la factura (`createdAt`).
- `GET /payments/history` usa `buildDateRange` sobre `fechaPago`. Sin fechas se mantiene `take: 200`.

### `reservations/reservations.controller.ts` + `reservations.service.ts`
- `GET /reservations` acepta `dateFrom` y `dateTo`, y filtra por la hora de inicio de la reserva.

### `audit/audit.controller.ts` + `audit.service.ts`
- `GET /audit` acepta `dateFrom` y `dateTo`. Con un rango, el límite sube a 2000 registros.

### `reports/reports.controller.ts` + `reports.service.ts`
- `revenue`: el rango personalizado funciona incluso con una sola fecha, `period=all` trae todo el histórico y la respuesta incluye `rango`.
- `peak-hours` y `spaces-utilization`: ahora respetan `dateFrom` y `dateTo`. Antes ignoraban las fechas.
- **NUEVO** `GET /reports/daily-flow?dateFrom&dateTo` (solo ADMIN). Devuelve el flujo por día: entradas, salidas, pagos, ingresos y estancia promedio, además de totales, promedio de entradas por día y el día de mayor flujo. Sin fechas usa los últimos 7 días.

---

## FRONTEND

### NUEVO: `src/utils/dateFilters.ts`
- Modos de filtro: Todo, Hoy, Ayer, Esta semana (lunes a domingo), Últimos 7 días, Este mes, Últimos 30 días, Día específico y Rango de fechas.
- `resolveDateRange()` convierte el modo elegido en `dateFrom`/`dateTo` según la hora local del navegador.
- `buildDailySummary()` agrupa los registros por día para el análisis semanal.

### NUEVO: `src/utils/exportUtils.ts`
`exportToPDF()` y `exportToExcel()` son genéricos. Ambos archivos incluyen:
- el encabezado de la institución,
- el usuario y el rol que generó el reporte,
- el filtro aplicado,
- el resumen,
- las tablas de detalle.

### NUEVO: `src/components/common/DateRangeFilter.tsx`
La barra de filtros reutilizable. Tiene botones rápidos, un selector de día y un rango Desde/Hasta, y muestra el texto "Mostrando: …".

### NUEVO: `src/components/common/ExportButtons.tsx`
Los botones Exportar PDF y Exportar Excel, con el mismo estilo que ya tenía la página de Reportes.

### NUEVO: `src/components/common/DailySummaryPanel.tsx`
La tabla "por día" para el análisis semanal. Muestra la cantidad, el total, una barra de flujo y el día de mayor flujo.

### `pages/PaymentsPage.tsx` — CAJERO (y ADMIN)
- Filtro por **día** o **rango de fechas** en *Pendientes* (por fecha de factura) y en *Historial* (por fecha de pago).
- Tarjetas con el total del período, la cantidad de facturas y el promedio.
- Tabla "Recaudo por día del período".
- Exportación a PDF y Excel de la pestaña activa, con los filtros aplicados. El historial incluye además el recaudo por método de pago.
- Exportación de los vehículos activos.

### `pages/MovementsPage.tsx` — VIGILANTE (y ADMIN, CAJERO)
- El historial tiene filtro por día o rango (según la hora de entrada) y un mini resumen: entradas, finalizados, vehículos que siguen dentro y estancia promedio.
- Tabla "Entradas por día".
- Exportación a PDF y Excel con dos tablas: flujo por día (entradas y salidas) y detalle de movimientos.
- La pestaña de vehículos dentro también se puede exportar.

### `pages/ReportsPage.tsx` — ADMIN
- El selector de período se reemplazó por el filtro compartido. Por defecto quedan "Últimos 30 días", igual que antes.
- Todos los reportes respetan las fechas.
- NUEVO: gráfico y tabla "Flujo Diario de Vehículos e Ingresos" (el análisis semanal).
- El Excel tiene dos hojas nuevas, "Flujo Diario" y "Horas Pico". El PDF incluye el flujo diario y el filtro aplicado.

### `pages/ReservationsPage.tsx` — USUARIO (y ADMIN)
- Filtro por día o rango, que funciona junto con el filtro de estado.
- Exportación a PDF y Excel con el resumen por estado, las reservas por día y el detalle.

### `pages/AuditPage.tsx` — ADMIN
- Filtro por día o rango, que funciona junto con la búsqueda.
- Exportación a PDF y Excel.

---

## Cómo demostrar el análisis semanal
1. Ingrese como CAJERO, abra *Historial de Facturas Pagadas* y elija **Esta semana** o **Últimos 7 días**. Verá el total, la tabla por día y podrá exportar a Excel o PDF.
2. Ingrese como VIGILANTE, abra *Historial de Movimientos* y elija **Rango de fechas** de lunes a domingo. Verá las entradas y salidas por día.
3. Ingrese como ADMIN, abra *Reportes* y elija **Esta semana**. Verá el gráfico de flujo diario y el día de mayor flujo, y podrá exportar.
