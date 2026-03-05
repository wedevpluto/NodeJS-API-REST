# NodeJS API REST — Sistema de Gestión Gastronómica

[![CI](https://github.com/wedevpluto/NodeJS-API-REST/actions/workflows/ci.yml/badge.svg)](https://github.com/wedevpluto/NodeJS-API-REST/actions/workflows/ci.yml)

API REST desarrollada con arquitectura modular, orientada a la gestión operativa integral de establecimientos gastronómicos. Construida sobre tecnologías de industria actuales, ofrece una solución backend segura, escalable y de fácil integración con cualquier cliente frontend o móvil.

---

## Tecnologías

| Tecnología | Propósito |
|---|---|
| **Node.js + TypeScript** | Entorno de ejecución con tipado estático |
| **NestJS** | Framework backend modular sobre Express |
| **Prisma ORM** | Acceso a datos con migraciones y tipado automático |
| **PostgreSQL** | Motor de base de datos relacional |
| **JWT + Refresh Tokens** | Autenticación stateless con renovación de sesión |
| **Swagger / OpenAPI** | Documentación interactiva de la API |
| **Docker + Docker Compose** | Contenerización para entornos reproducibles |
| **Jest** | Framework de testing unitario |

---

## Módulos del sistema

| Módulo | Descripción |
|---|---|
| `auth` | Autenticación, registro y renovación de tokens |
| `users` | Administración de usuarios del sistema |
| `sectores` | Gestión de zonas del establecimiento |
| `mesas` | Control de mesas por sector con estado en tiempo real |
| `articulos` | Administración del menú con categorías y disponibilidad |
| `comandas` | Gestión de órdenes activas por mesa |
| `pedidos` | Control de ítems dentro de cada comanda |
| `arqueos` | Registro y cierre de caja diario |

---

## Control de acceso por roles

| Rol | Alcance |
|---|---|
| `ADMIN` | Acceso completo al sistema |
| `MOZO` | Operación de mesas, comandas y pedidos |
| `CAJERO` | Gestión de comandas, cierre y arqueos |

---

## Seguridad

- Autenticación mediante **JWT** con access token (15 min) y refresh token (7 días)
- Control de acceso basado en roles (**RBAC**) por endpoint
- Validación estricta de datos de entrada mediante **DTOs** con `class-validator`
- **Rate limiting** configurado a 10 solicitudes por minuto por IP
- Manejo centralizado de excepciones con respuestas estructuradas y consistentes
- Contraseñas almacenadas con hash **bcrypt**

---

## Puesta en marcha con Docker

**Requisitos:** Docker y Docker Compose

```bash
git clone https://github.com/wedevpluto/NodeJS-API-REST.git
cd NodeJS-API-REST
docker compose up --build
```

- API disponible en: `http://localhost:3000`
- Documentación Swagger en: `http://localhost:3000/docs`

---

## Instalación local

**Requisitos:** Node.js 20+ y PostgreSQL 16+

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Aplicar migraciones y generar cliente Prisma
npx prisma generate
npx prisma migrate dev

# Iniciar en modo desarrollo
npm run start:dev
```

---

## Variables de entorno

```env
DATABASE_URL=postgresql://usuario:password@localhost:5432/api_db
JWT_SECRET=clave-secreta-segura
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=clave-refresh-segura
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000
```

---

## Endpoints principales

### Autenticación
```
POST   /auth/register              Registro de usuario
POST   /auth/login                 Inicio de sesión y emisión de tokens
POST   /auth/refresh               Renovación de access token
```

### Gestión del establecimiento
```
GET    /sectores                   Listar sectores
POST   /sectores                   Crear sector
GET    /mesas                      Consultar mesas con estado actual
PATCH  /mesas/:id/estado           Actualizar estado de mesa
```

### Menú
```
GET    /articulos                  Listar artículos (filtrable por categoría)
POST   /articulos                  Registrar artículo
PATCH  /articulos/:id/disponible   Alternar disponibilidad de artículo
```

### Operación diaria
```
POST   /comandas                   Abrir comanda en una mesa
GET    /comandas/abiertas          Consultar comandas activas
POST   /pedidos                    Agregar ítem a una comanda
PATCH  /pedidos/:id/estado         Actualizar estado de un pedido
PATCH  /comandas/:id/cerrar        Cerrar comanda y liberar mesa
POST   /arqueos                    Registrar arqueo de caja
GET    /arqueos/ultimo             Consultar último arqueo registrado
```

> Documentación interactiva completa disponible en `/docs`

---

## Flujo operativo

```
1. El mozo abre una comanda en la mesa asignada    →  POST /comandas
2. El mozo registra los pedidos del cliente        →  POST /pedidos
3. El mozo actualiza el estado de cada pedido      →  PATCH /pedidos/:id/estado
4. El cajero cierra la comanda al finalizar        →  PATCH /comandas/:id/cerrar
5. El cajero registra el arqueo al cierre del día  →  POST /arqueos
```

---

## Testing

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar con reporte de cobertura
npm run test:cov
```

**17 suites · 30 tests · 100% aprobados**

---

## Estructura del proyecto

```
src/
├── auth/           Autenticación y estrategias JWT
├── users/          Gestión de usuarios
├── sectores/       Sectores del establecimiento
├── mesas/          Mesas por sector
├── articulos/      Menú y artículos
├── comandas/       Comandas por mesa
├── pedidos/        Pedidos dentro de cada comanda
├── arqueos/        Arqueo de caja
├── common/         Filtros globales, DTOs y utilidades compartidas
└── database/       Configuración y servicio de Prisma
```

---

## Autor

**Agustín** — [@wedevpluto](https://github.com/wedevpluto)