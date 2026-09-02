# Online Course System (EduPro)

## Overview

EduPro là hệ thống khóa học trực tuyến gồm SPA React và REST API Spring Boot. Hệ thống hiện hỗ trợ catalog khóa học, đăng ký học, theo dõi tiến độ, nộp/chấm bài, chứng chỉ, thông báo và các màn hình quản trị.

> Thanh toán hiện chỉ là luồng mô phỏng (`DEMO_NO_PROVIDER`). Không nhập dữ liệu thẻ thật và không dùng luồng này để bán khóa học trong production.

## Features

- Đăng ký, đăng nhập bằng email/password; JWT bearer authentication.
- Khung OAuth2 cho Google/Facebook.
- Catalog, tìm kiếm/lọc/sắp xếp và chi tiết khóa học.
- Giỏ hàng, checkout mô phỏng và enrollment.
- Nội dung video YouTube, tài liệu, quiz phía client và bài tập.
- Tiến độ học, thời gian học, yêu cầu chấm điểm và chứng chỉ.
- Review sau khi hoàn thành khóa học.
- Dashboard học viên, quản trị và giảng viên.
- Quản lý khóa học, học viên, giảng viên và submission.

## Architecture

```text
Browser
  ↓
React 18 + React Router + AppContext
  ↓  fetch/JSON + Bearer JWT
Spring Security / JwtAuthFilter
  ↓
REST Controller
  ↓
Spring Data JPA Repository
  ↓
MySQL 8 (edu_online)
```

Backend hiện là kiến trúc controller–repository; `GradingService` chứa transaction cấp điểm/chứng chỉ và `CourseResponseMapper` tách response public khỏi nội dung bài học được bảo vệ.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript/TSX, Vite 6, Tailwind CSS 4, MUI/Radix UI |
| Routing/state | React Router 7, React Context |
| Backend | Java 17, Spring Boot 3.2.4, Spring MVC, Spring Security |
| Persistence | Spring Data JPA, Hibernate, MySQL Connector/J |
| Authentication | BCrypt, JWT (JJWT 0.12.5), optional OAuth2 |
| Build | npm, Maven |

Không có Redis, message broker, object storage, migration framework, Docker hoặc CI/CD trong repository hiện tại.

## Prerequisites

- JDK 17 (khuyến nghị; code compile target Java 17).
- Maven 3.8+.
- MySQL Server 8.0+ và MySQL client.
- Node.js 18+ và npm 9+.

## Project Structure

```text
.
├── frontend/
│   ├── main.tsx                  # frontend entry point
│   ├── app/routes.ts             # route table
│   ├── app/context/AppContext.tsx# global auth/data/actions
│   ├── app/lib/api.ts            # fetch client
│   ├── app/pages/                # public/student/admin/instructor pages
│   ├── app/components/           # application and UI components
│   └── app/data/mockData.ts      # development fallback and TS models
├── backend-spring/
│   ├── pom.xml
│   ├── schema.sql                # baseline schema (not a migration)
│   └── src/
│       ├── main/java/com/edupro/
│       │   ├── EduProApplication.java
│       │   ├── config/           # security and optional admin seed
│       │   ├── controller/       # REST API and global error handler
│       │   ├── entity/           # JPA entities
│       │   ├── repository/       # Spring Data repositories
│       │   ├── security/         # JWT/OAuth2
│       │   └── service/          # grading and course response mapping
│       └── test/java/            # backend unit/security regression tests
├── .env.example
├── package.json
└── vite.config.ts
```

## Environment Variables

Spring Boot không tự động đọc file `.env`. Hãy cấu hình các biến trong terminal, IDE run configuration hoặc secret manager. Sao chép `.env.example` chỉ để tham khảo; không commit `.env` thật.

| Variable | Service | Required | Description | Example |
|---|---|---:|---|---|
| `DB_URL` | Backend | No | JDBC URL; có default localhost/`edu_online` | `jdbc:mysql://127.0.0.1:3306/edu_online?...` |
| `DB_USER` | Backend | No | Database user; default `root` | `edupro_app` |
| `DB_PASSWORD` | Backend | Yes* | Database password (*trừ khi account không có password) | local secret |
| `JWT_SECRET` | Backend | Yes | Random signing key, ít nhất 32 bytes | random secret |
| `JWT_EXPIRATION_MS` | Backend | No | Token lifetime; default 86400000 ms | `86400000` |
| `CORS_ALLOWED_ORIGINS` | Backend | No | Comma-separated exact frontend origins | `http://localhost:5173` |
| `OAUTH2_REDIRECT_URI` | Backend | No | Frontend OAuth completion route | `http://localhost:5173/oauth2/redirect` |
| `GOOGLE_CLIENT_ID/SECRET` | Backend | No | Google OAuth credentials | provider secret |
| `FACEBOOK_CLIENT_ID/SECRET` | Backend | No | Facebook OAuth credentials | provider secret |
| `SEED_ADMIN_ENABLED` | Backend | No | Enables optional admin bootstrap; default false | `true` |
| `SEED_ADMIN_EMAIL` | Backend | Conditional | Required when admin seed is enabled | `admin@example.local` |
| `SEED_ADMIN_PASSWORD` | Backend | Conditional | Required when seed enabled; min 12 chars | local secret |
| `SEED_DEMO_ENABLED` | Backend | No | Creates an idempotent demo catalog with IT courses | `false` |
| `VITE_API_BASE_URL` | Frontend | No | Backend origin; default localhost:8080 | `http://localhost:8080` |

Rotate any password/JWT key that was previously stored in source or shared history.

## Database Setup

`schema.sql` creates database `edu_online` and nine tables. It is a baseline installer, not an incremental migration tool; `spring.jpa.hibernate.ddl-auto=none` means Spring will not create/update the schema.

Open a MySQL shell without placing a password in command history:

```bash
mysql -u root -p
```

Then run:

```sql
SOURCE D:/Online course system/backend-spring/schema.sql;
```

For a least-privilege local account (replace the password interactively/appropriately):

```sql
CREATE USER IF NOT EXISTS 'edupro_app'@'localhost' IDENTIFIED BY 'replace-local-password';
GRANT SELECT, INSERT, UPDATE, DELETE ON edu_online.* TO 'edupro_app'@'localhost';
FLUSH PRIVILEGES;
```

There is no migration or sample course seed command. Re-running `schema.sql` only creates missing tables; it does not upgrade existing table definitions.

## Backend Setup

PowerShell example:

```powershell
cd "backend-spring"
$env:DB_USER = "edupro_app"
$env:DB_PASSWORD = "your-local-db-password"
$env:JWT_SECRET = "replace-with-a-random-secret-of-at-least-32-bytes"
mvn spring-boot:run
```

Backend URL: `http://localhost:8080`

Health check:

```bash
curl http://localhost:8080/api/health
```

Expected response:

```json
{"ok":true,"service":"EduPro API (Spring MVC)"}
```

Admin seeding is disabled by default. For a local one-time seed, also set `SEED_ADMIN_ENABLED=true`, `SEED_ADMIN_EMAIL`, and a `SEED_ADMIN_PASSWORD` of at least 12 characters. Disable it again after creation. Passwords are never logged.

To add the local demo catalog, set `SEED_DEMO_ENABLED=true` and restart the backend. This creates two demo instructor profiles and four IT courses (Spring Boot, React/TypeScript, MySQL, and Docker/CI/CD). Existing courses with the same demo IDs are preserved, so the seed can be run repeatedly without duplication. Set the variable back to `false` after the first successful run.

## Frontend Setup

In a second terminal:

```bash
cd "Online course system"
npm install
npm run dev
```

- Frontend URL: `http://localhost:5173`
- Backend API URL: `VITE_API_BASE_URL` or `http://localhost:8080`

## Running the Application

Startup order:

1. MySQL 8.
2. Spring Boot backend.
3. Vite frontend.

## Quick Start

```bash
git clone <repository-url>
cd "Online course system"

# Import backend-spring/schema.sql into MySQL first.
# Terminal 1: export DB_USER, DB_PASSWORD and JWT_SECRET, then:
cd backend-spring
mvn spring-boot:run

# Terminal 2, from repository root:
npm install
npm run dev
```

Open `http://localhost:5173` and verify `http://localhost:8080/api/health` independently if the UI cannot load data.

## Testing

Backend:

```bash
cd backend-spring
mvn test
```

Frontend production build:

```bash
npm run build
```

The repository currently has backend unit/security regression tests. It does not yet have frontend component tests or end-to-end tests.

## API

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | Health check |
| POST | `/api/auth/register` | Public | Create student account |
| POST | `/api/auth/login` | Public | Issue JWT |
| GET | `/api/auth/me` | JWT | Current profile |
| GET | `/api/courses` | Public | Catalog; restricted lesson fields omitted unless admin JWT is sent |
| GET | `/api/courses/{id}` | Public/JWT | Course detail; full content only for enrolled student, owner instructor or admin |
| POST/PUT/DELETE | `/api/courses[/{id}]` | ADMIN | Manage courses |
| POST | `/api/courses/{id}/reviews` | JWT + completed enrollment | Add one review |
| GET | `/api/instructors[/{id}]` | Public | Instructor directory |
| GET | `/api/enrollments/me` | JWT | Current user's enrollments |
| POST | `/api/enrollments` | STUDENT | Enroll (no payment verification; demo limitation) |
| GET | `/api/enrollments/{courseId}/content` | Enrolled/owner/admin | Protected lesson content |
| PATCH | `/api/enrollments/{courseId}` | Enrolled user | Update valid lesson progress only |
| POST | `/api/enrollments/{courseId}/lessons/{lessonId}/submit` | Enrolled user | Submit one lesson |
| POST | `/api/enrollments/{courseId}/submit-for-grading` | Enrolled + all lessons complete | Request final grading |
| GET/POST/DELETE | `/api/cart[/{courseId}]` | JWT | Cart operations |
| POST | `/api/cart/checkout` | STUDENT | Demo checkout/enrollment |
| GET/PATCH | `/api/notifications[...]` | JWT + owner | Notification operations |
| GET | `/api/certificates/me`, `/api/certificates/{courseId}` | JWT + owner | Certificates |
| GET/POST | `/api/activity/weekly`, `/api/activity/log` | JWT | Study activity |
| GET/PATCH | `/api/instructor/...` | INSTRUCTOR + course owner | Courses/submission grading |
| GET/POST/PUT/PATCH/DELETE | `/api/admin/...` | ADMIN | Reports and management |

## Security Notes

- Never commit database credentials, JWT keys or OAuth client secrets.
- JWT is stored in browser `localStorage`; a future production hardening should move sessions to secure HttpOnly cookies or implement a robust refresh-token design.
- OAuth returns the token in the URL fragment, which is removed by `/oauth2/redirect` before navigation.
- Public course responses contain curriculum metadata only; lesson bodies and quiz answers require authorization.
- Add rate limiting at the gateway/application layer before exposing login/register publicly.

## Troubleshooting

### Database connection refused

- Cause: MySQL is stopped, wrong port, or wrong `DB_URL`.
- Diagnose: check MySQL service and `mysql -u <user> -p`.
- Fix: start MySQL and correct the JDBC host/port/database.

### Access denied for database user

- Cause: wrong `DB_USER`/`DB_PASSWORD` or missing grants.
- Diagnose: connect with the same account using MySQL client.
- Fix: reset credentials or grant access to `edu_online.*`.

### `JWT_SECRET` could not be resolved

- Cause: required environment variable is missing.
- Fix: set a random secret of at least 32 bytes before starting Spring Boot.

### Port 8080 or 5173 already in use

- Diagnose on Windows: `Get-NetTCPConnection -LocalPort 8080`.
- Fix: stop the conflicting process. Vite is configured with `strictPort: true`.

### CORS error

- Cause: browser origin is absent from `CORS_ALLOWED_ORIGINS`.
- Fix: add the exact origin (scheme, host and port), comma-separated for multiple origins.

### Frontend shows fallback courses

- Cause: public API or database was unavailable during initial load.
- Diagnose: request `/api/health` and `/api/courses` directly and inspect browser Network errors.
- Fix: restore backend/database connectivity, then refresh.

### 401/403

- 401: token missing, invalid or expired; sign in again.
- 403: the authenticated role/resource owner is not authorized.

### OAuth login fails

- Cause: provider credentials or callback URL are not configured.
- Fix: set provider variables and register `http://localhost:8080/api/auth/oauth2/callback/{provider}` at the provider. Email/password login works without OAuth configuration.

### Maven command missing

- Install Maven 3.8+ and add its `bin` directory to `PATH`, or configure Maven through the IDE.

## Audit

The detailed architecture, feature matrix, findings, implemented changes, remaining risks and health score are in [`docs/FULL_AUDIT_REPORT.md`](docs/FULL_AUDIT_REPORT.md).
