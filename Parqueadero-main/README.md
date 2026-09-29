# 🚗 SISTEMA EMPRESARIAL DE GESTIÓN INTELIGENTE DE PARQUEADEROS UNIVERSITARIOS

> **Proyecto Final de Sistemas Empresariales**  
> *Aplicación Web de Categoría Empresarial Completa, Funcional, Integrada y Demostrable.*

---

## 📋 1. DESCRIPCIÓN Y OBJETIVO DEL SISTEMA

El **Sistema Empresarial de Gestión Inteligente de Parqueaderos Universitarios** es una solución integral desarrollada para centralizar, automatizar y optimizar la administración del parqueadero en un campus universitario privado.

### 🔴 Problema Abordado
- Incertidumbre sobre la disponibilidad real de plazas de estacionamiento.
- Registro manual ineficiente de entradas y salidas propenso a errores humanos.
- Falta de validación sobre el estado de los vehículos y la vigencia del usuario (bloqueados o inactivos).
- Cálculo manual inconsistente de tarifas y demoras en caja.
- Imposibilidad de generar estadísticas de ocupación, horas pico e ingresos consolidados para la toma de decisiones administrativas.

### 🟢 Solución Empresarial
Plataforma web desacoplada en tiempo real con:
- **Control de Acceso mediante Códigos QR** y alternativa de búsqueda instantánea por placa.
- **Cálculo Automático de Tarifas en Backend** considerando tipo de usuario (estudiante, docente, administrativo, visitante), tipo de vehículo, valores mínimos y topes máximos.
- **Mapa de Parqueadero Grid Interactivo** con códigos de color, badges e iconos de accesibilidad.
- **Módulo de Caja y Comprobantes PDF** con simulación de pasarela de pago digital.
- **Generación de Reportes con Exportación Funcional en PDF y Excel (.xlsx)**.
- **Seguridad basada en Roles (RBAC)** con autenticación JWT, hash de contraseñas Bcrypt y auditoría inmutable de trazabilidad.

---

## 🛠️ 2. ARQUITECTURA TÉCNICA Y STACK DE TECNOLOGÍAS

```
                                  [ Navegador Web ]
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   │  Frontend: React 18 + TypeScript + Vite  │
                   │  Tailwind CSS / Lucide / Recharts / jsPDF  │
                   └─────────────────────┬─────────────────────┘
                                         │  HTTP / REST API (JWT Bearer Token)
                                         ▼
                   ┌───────────────────────────────────────────┐
                   │    Backend: NestJS (Controllers/Services) │
                   │    Prisma ORM + Passport JWT + Bcrypt     │
                   └─────────────────────┬─────────────────────┘
                                         │
                                         ▼
                   ┌───────────────────────────────────────────┐
                   │  Base de Datos Relacional: SQLite / PG   │
                   └───────────────────────────────────────────┘
```

### Stack Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Estilos UI**: Tailwind CSS, Lucide Icons
- **Gráficos**: Recharts
- **Exportación**: `jspdf`, `jspdf-autotable`, `xlsx`
- **QR**: `qrcode.react`, `html5-qrcode`

### Stack Backend
- **Framework**: NestJS + TypeScript
- **ORM**: Prisma ORM v5
- **Seguridad**: JWT Passport, Bcryptjs, Class Validator DTO
- **Motor BD**: SQLite (despliegue local inmediato) / PostgreSQL (soporte Docker)

---

## 🔑 3. USUARIOS Y CREDENCIALES DE DEMOSTRACIÓN

Para la sustentación académica ante docentes, el sistema incluye usuarios pre-configurados con datos semilla realistas:

| Rol del Sistema | Correo Electrónico | Contraseña | Descripción de Permisos |
|---|---|---|---|
| **ADMIN** | `admin@parqueadero.com` | `Admin123!` | Acceso total: Dashboard, Usuarios, Vehículos, Espacios, Tarifas, Reservas, Pagos, Reportes y Auditoría. |
| **VIGILANTE** | `vigilante@parqueadero.com` | `Vigilante123!` | Control de acceso: Lector QR, Registro de Entradas/Salidas, Mapa de Espacios y consulta de vehículos dentro. |
| **CAJERO** | `cajero@parqueadero.com` | `Cajero123!` | Módulo de caja: Consulta de pagos pendientes, liquidación con pasarela simulada y emisión de comprobantes PDF. |
| **USUARIO** | `estudiante@parqueadero.com` | `User123!` | Portal estudiante: Consulta de vehículos propios, reservas de plazas y comprobantes. |
| **USUARIO** | `docente@parqueadero.com` | `User123!` | Portal docente. |
| **BLOQUEADO** | `bloqueado@parqueadero.com` | `User123!` | Usuario bloqueado por morosidad para probar rechazo de acceso. |

---

## 🚀 4. INSTRUCCIONES DE INSTALACIÓN Y EJECUCIÓN

### Requisitos Previos
- **Node.js**: v18.0.0 o superior
- **NPM**: v9.0.0 o superior

### Paso 1: Ejecutar Backend (Servidor REST API)
```bash
# Navegar a la carpeta del backend
cd backend

# Instalar dependencias
npm install

# Generar cliente de Prisma y sincronizar base de datos
npx prisma db push

# Poblado de datos iniciales (Seed Data)
npx ts-node prisma/seed.ts

# Iniciar servidor en modo desarrollo (Puerto 4000)
npm run start:dev
```
El servidor backend quedará disponible en `http://localhost:4000/api`.

### Paso 2: Ejecutar Frontend (Aplicación React)
Abrir una nueva terminal:
```bash
# Navegar a la carpeta del frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar cliente web (Puerto 5173)
npm run dev
```
Abrir en el navegador: **`http://localhost:5173`**

---

## 🧪 5. PRUEBAS AUTOMATIZADAS

Para ejecutar la suite de pruebas unitarias en el backend (cálculo de tarifas, reglas de negocio):
```bash
cd backend
npm run test
```

---

## 🎬 6. FLUJO PASO A PASO PARA LA DEMOSTRACIÓN ACADÉMICA

1. **Inicio de Sesión**: Iniciar sesión como `ADMIN` (`admin@parqueadero.com` / `Admin123!`).
2. **Dashboard Operativo**: Observar métricas en tiempo real de ocupación (espacios ocupados vs libres) y gráficos de flujo.
3. **Gestión de Usuarios y Vehículos**: Consultar la lista de usuarios y vehículos autorizados. Ver el carné con código QR del vehículo `KLR-456`.
4. **Cierre de Sesión e Ingreso como VIGILANTE**:
   - Iniciar sesión como `vigilante@parqueadero.com` / `Vigilante123!`.
   - Ir al módulo **Control de Acceso / QR**.
   - Hacer clic en **Escanear QR o Ingresar Placa para ENTRADA**.
   - Usar el botón de acceso rápido **`MXZ-890` (Docente)**.
   - El sistema validará la autorización y asignará automáticamente el espacio `A-02`.
   - Ir al **Mapa de Espacios** y comprobar que el espacio `A-02` ahora está 🔴 **OCUPADO**.
5. **Registro de Salida**:
   - En **Control de Acceso**, registrar la salida del vehículo `MXZ-890`.
   - El backend calculará automáticamente la tarifa de tiempo transcurrido y marcará la factura como `PENDIENTE`. El espacio vuelve a 🟢 **DISPONIBLE**.
6. **Ingreso como CAJERO y Cobro**:
   - Iniciar sesión como `cajero@parqueadero.com` / `Cajero123!`.
   - Ir a **Gestión de Pagos**. Seleccionar la factura pendiente y presionar **Procesar Cobro**.
   - Seleccionar método de pago (Tarjeta o Pago Digital) y confirmar transacción.
   - Presionar **Descargar Factura PDF** para obtener el comprobante oficial impreso.
7. **Generación de Reportes y Exportación**:
   - Volver a iniciar sesión como `ADMIN`.
   - Ir a **Reportes y Exportación**.
   - Presionar **Exportar PDF** y **Exportar Excel** para demostrar la descarga efectiva de informes estructurados con totales e información institucional.


---

## 📖 7. DOCUMENTACIÓN TÉCNICA DETALLADA

Además de este README, el proyecto incluye documentación técnica generada automáticamente:

- `docs/architecture.md` → Diagrama y descripción de arquitectura
- `docs/database.md` → Esquema de base de datos y relaciones
- `docs/api.md` → Referencia de endpoints del backend
- `docs/security.md` → Autenticación JWT, RBAC, auditoría
- `diagrams/` → Diagramas Mermaid (arquitectura, workflows, dependencias)

Esta documentación sirve como referencia técnica para la revisión del código fuente.