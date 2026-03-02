# Enterprise REST API

Production-ready REST API built with **NestJS**, **Prisma ORM**, and **PostgreSQL**, following modern backend engineering practices and scalable enterprise architecture principles.

This project demonstrates a secure and modular backend implementation including JWT authentication, protected endpoints, database migrations, and automated CLI workflows.

The architecture is designed to be maintainable, scalable, and aligned with real-world backend development standards.

---

## Tech Stack

- **Framework:** NestJS (TypeScript)
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Authentication:** JWT + Passport
- **Validation:** class-validator
- **Documentation:** Swagger (OpenAPI)
- **Containerization:** Docker

---

## Features

- Modular architecture
- Prisma ORM integration
- PostgreSQL database
- Dockerized database environment
- JWT authentication
- Password hashing with bcrypt
- Protected routes with Guards
- DTO validation
- Swagger API documentation
- Environment-based configuration
- Prisma migrations
- CLI automation scripts

---

## Project Structure

src/
├── auth/
│ ├── guards/
│ ├── auth.controller.ts
│ ├── auth.service.ts
│ ├── auth.module.ts
│ └── jwt.strategy.ts
│
├── users/
│ ├── dto/
│ ├── users.controller.ts
│ ├── users.service.ts
│ └── users.module.ts
│
├── database/
│ ├── prisma.module.ts
│ └── prisma.service.ts
│
├── app.module.ts
└── main.ts

prisma/
└── schema.prisma

---

The project follows a modular design based on **separation of concerns**, allowing independent scaling of application components.

---

## Authentication

The API uses **JWT-based authentication**.

### Register User

Example request:

```json
{
  "email": "user@test.com",
  "password": "123456",
  "name": "User"
}

---

POST /auth/login

Example request:
{
  "email": "user@test.com",
  "password": "123456"
}

Response:
{
  "access_token": "JWT_TOKEN"
}

Authorized Requests.

Protected endpoints require a Bearer token.

curl http://localhost:3000/users \
-H "Authorization: Bearer TOKEN"

---

Users Endpoints.

GET /users

Requires JWT authentication.

curl http://localhost:3000/users \
-H "Authorization: Bearer $(./login.sh)"

---

Swagger documentation is available at:
http://localhost:3000/docs
Swagger includes integrated JWT authentication using the Authorize button.

---

Environment Variables

Create a .env file in the project root:

DATABASE_URL=postgresql://admin:admin@localhost:5432/api_db
JWT_SECRET=supersecret
PORT=3000

---

Docker Database Setup

Start PostgreSQL container:

docker run -d \
--name postgres_api \
-e POSTGRES_USER=admin \
-e POSTGRES_PASSWORD=admin \
-e POSTGRES_DB=api_db \
-p 5432:5432 \
postgres:16

---

Database Setup

Run migrations:
npx prisma migrate dev

---

Generate Prisma client:
npx prisma generate

---

Running the Project

Install dependencies:
npm install

---

Start development server:
npm run start:dev

---

Server runs at:
http://localhost:3000

---

CLI Authentication Script

The project includes a helper script to automatically obtain a JWT token.

./login.sh

Returns:

JWT_TOKEN

---

Example usage:
curl http://localhost:3000/users \
-H "Authorization: Bearer $(./login.sh)"

This approach ensures authenticated requests always use a valid token without manual updates.

Security Features

Password hashing using bcrypt

JWT authentication

Protected endpoints with Guards

DTO input validation

Unique email constraint

Environment-based configuration

Testing with curl
Register
curl -X POST http://localhost:3000/auth/register \
-H "Content-Type: application/json" \
-d '{"email":"user@test.com","password":"123456","name":"User"}'
Login
curl -X POST http://localhost:3000/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"user@test.com","password":"123456"}'
Get Users
curl http://localhost:3000/users \
-H "Authorization: Bearer $(./login.sh)"
Architecture Principles

This project follows backend engineering best practices:

Clean modular architecture

Dependency Injection

Separation of concerns

Scalable project structure

Secure authentication flow

Environment-based configuration

Reproducible database setup

Future Improvements

Planned improvements for production environments:

Role-Based Access Control (RBAC)

Refresh token authentication

Global exception handling

Structured logging

Automated tests

CI/CD pipeline

Rate limiting

API versioning




# AUTOMATION SCRIPT FOR GETTING TOKEN

source login.sh
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/users