# ONLINE COURSE SYSTEM — FULL AUDIT REPORT

Audit date: 2026-09-02  
Scope: all repository-owned source/configuration files under `frontend/` and `backend-spring/`, root manifests, schema, documentation, generated/diagnostic inventory, API call sites, build and tests.

## 1. Project Overview

- Tech stack: React 18 + TypeScript/TSX + Vite 6; Java 17 + Spring Boot 3.2.4; MySQL 8.
- Architecture: browser SPA calling a JSON REST API. Spring Security authenticates JWT/OAuth2; controllers call JPA repositories. `GradingService` owns the grading/certificate transaction.
- Backend entry point: `backend-spring/src/main/java/com/edupro/EduProApplication.java`.
- Frontend entry point: `frontend/main.tsx`; routes are in `frontend/app/routes.ts`.
- Database: `edu_online`, baseline installer in `backend-spring/schema.sql`; no migration framework.
- Authentication: BCrypt password hash, signed JWT bearer token, optional Google/Facebook OAuth2. Roles are `student`, `instructor`, and `admin`.
- State management: one React Context (`AppContext`); no Redux/query cache.
- File storage: none. Course media are external URLs and course text is stored in JSON columns.
- External services: Google/Facebook OAuth2, YouTube embeds, remote image/avatar URLs. No real payment provider.

## 2. Project Structure

```text
Online course system/
├── frontend/
│   ├── main.tsx
│   ├── app/
│   │   ├── App.tsx, routes.ts
│   │   ├── context/AppContext.tsx
│   │   ├── lib/api.ts
│   │   ├── data/mockData.ts
│   │   ├── pages/{student,admin,instructor}
│   │   └── components/{application,ui}
│   └── styles/
├── backend-spring/
│   ├── pom.xml, schema.sql
│   └── src/
│       ├── main/java/com/edupro/{config,controller,dto,entity,repository,security,service}
│       ├── main/resources/application.properties
│       └── test/java/com/edupro/
├── docs/FULL_AUDIT_REPORT.md
├── package.json, package-lock.json, vite.config.ts
├── .env.example, .gitignore
└── README.md
```

The root also contained `.idea/`, `node_modules/`, `dist/`, `dom_dump.html`, and `get_logs.mjs`. They are now ignored, but were not deleted because this workspace is not a Git worktree and the diagnostic files may belong to the user.

## 3. System Architecture

```text
User
  ↓
React page/component + React Router
  ↓
AppContext action / apiFetch
  ↓  HTTP JSON; optional Authorization: Bearer <JWT>
SecurityFilterChain → JwtAuthFilter → method role checks
  ↓
REST Controller
  ├─→ GradingService (transactional grading/certificate flow)
  ├─→ CourseResponseMapper (public/protected projection)
  └─→ Spring Data JPA Repository
        ↓
      Hibernate / MySQL Connector
        ↓
      MySQL `edu_online`
```

There is no general service layer: most controllers still contain business logic and manual response mapping. This is acceptable for the current project size but increases duplication and test cost.

## 4. Main Features

| Feature | Frontend | Backend | Database | Status after fixes |
|---|---|---|---|---|
| Register/login/logout | `Register`, `Login`, `AppContext` | `AuthController` | `users` | Working; no rate limit/refresh token |
| OAuth2 | redirect page + route | OAuth2 security classes | `users` | Implemented, not live-verified without provider credentials |
| Course catalog/search/filter | `Home`, `Courses`, `CourseCard` | `CourseController` | `courses` | Working; all rows loaded, no pagination |
| Course detail/curriculum | `CourseDetail` | public course endpoints | `courses.chapters` JSON | Working; lesson bodies/answers now redacted publicly |
| Cart | `Cart`, `AppContext` | `CartController` | `cart_items` | Working |
| Checkout/payment | `Cart` | `POST /api/cart/checkout` | enrollments only | Demo only; no payment verification |
| Enrollment | `AppContext` | `EnrollmentController` | `enrollments` | Working; duplicate/nonexistent course protected |
| Lesson access/progress | `Learn` | enrollment content/progress endpoints | enrollment JSON | Protected; IDs validated |
| Quiz | `Learn`, admin course editor | no server evaluator | course JSON | Incomplete: client-only score, not persisted |
| Exercise submission | `Learn` | submission endpoint | `lesson_submissions` | Working; membership/content/duplicate checks added |
| Final grading | admin/instructor pages | controllers + `GradingService` | submissions/enrollments | Working; owner/range checks added |
| Certificate | `Certificate` PDF UI | `CertificateController` | `certificates` | Working after authorized final grade ≥70 |
| Reviews/ratings | `CourseDetail` | course review endpoint | `courses.reviews` JSON | Working; one review/user and range validation |
| Notifications | layout/dashboard | `NotificationController` | `notifications` | Working; owner filter on mark-read |
| Study activity | dashboard/learn timer | `UserActivityController` | `user_activities` | Working; minutes can still be client-inflated |
| Student dashboard | `Dashboard` | several current-user APIs | several | Working |
| Admin dashboard/manage | admin pages | `AdminController`, course endpoints | several | Working; performance issues remain |
| Instructor grading | instructor pages | `InstructorController` | courses/submissions | Working; now based on course ownership |

Representative feature flow:

```text
Student marks lesson complete
→ Learn.handleCompleteLesson
→ AppContext.completeLesson
→ PATCH /api/enrollments/{courseId}
→ EnrollmentController validates enrollment and lesson IDs
→ EnrollmentRepository
→ enrollments.completed_lessons
→ normalized enrollment JSON
→ AppContext updates progress UI
```

```text
Instructor grades final request
→ InstructorGradeSubmissions
→ PATCH /api/instructor/submissions/{id}
→ InstructorController verifies course.instructor_id
→ GradingService validates 0..100 and grades submission
→ enrollment completion + optional certificate + notification
→ response updates grading UI
```

## 5. System Flow

On startup, `AppContext` loads public courses/instructors, reads `edupro_token`, verifies `/api/auth/me`, then loads enrollment/cart/notification/activity concurrently. A failed public data request uses mock catalog data; a failed token verification clears the token. Authenticated student learning pages fetch protected course content separately.

JWT contains user ID and role, but `JwtAuthFilter` reloads the user and uses the current database record as principal. Resource ownership is checked in notification, certificate, enrollment-content, and instructor-grading flows.

## 6. Database Analysis

Actual tables:

| Table | Primary key | Important constraints/relationships |
|---|---|---|
| `users` | string `id` | unique email; role enum |
| `instructors` | string `id` | no FK/unique link to `users` |
| `courses` | string `id` | FK instructor; chapters/reviews/tags/etc. JSON |
| `enrollments` | string `id` | unique `(user_id,course_id)`; both FKs cascade |
| `cart_items` | `(user_id,course_id)` | both FKs cascade |
| `notifications` | string `id` | user FK cascade |
| `certificates` | string `id` | unique user/course; both FKs cascade |
| `lesson_submissions` | string `id` | user/course FKs cascade |
| `user_activities` | bigint identity | unique user/date; user FK cascade |

Strengths: PKs/FKs exist, user email and enrollment/certificate/activity business keys are unique, dependent student rows cascade, required fields generally use `NOT NULL`.

Issues:

- `instructors.email` is not unique and `instructors.id` is not an FK to `users`; the application manually keeps two records synchronized.
- Common query indexes are missing for `courses(category)`, `courses(instructor_id)`, `enrollments(course_id)`, `notifications(user_id,date)`, `lesson_submissions(course_id,submitted_at)`, and `lesson_submissions(user_id,course_id,lesson_id)`.
- No check constraints enforce nonnegative prices/student counters/activity, rating 0–5, grade 0–100, or discount ≤ price.
- JSON course structure prevents relational integrity for chapters/lessons/questions and makes lesson membership validation application-owned.
- `total_students` and `instructors.students` are denormalized and can drift on deletion/manual data changes.
- `schema.sql` is not a migration: `CREATE TABLE IF NOT EXISTS` will not add future columns/indexes to existing installations.

Recommended safe next step: adopt Flyway/Liquibase, baseline the current schema, clean duplicate instructor/submission data, then add indexes/constraints through versioned migrations. Do not normalize course JSON until usage and migration strategy are defined.

## 7. API Analysis

| Method | Endpoint | Controller | Authentication/roles | Description |
|---|---|---|---|---|
| GET | `/api/health` | Health | Public | Service health |
| POST | `/api/auth/register` | Auth | Public | Student registration |
| POST | `/api/auth/login` | Auth | Public | JWT login |
| GET | `/api/auth/me` | Auth | JWT | Current user |
| GET | `/api/auth/health` | Auth | JWT | Redundant auth health |
| GET | `/api/courses` | Course | Public; optional JWT | Catalog |
| GET | `/api/courses/{id}` | Course | Public; optional JWT | Public or authorized projection |
| POST | `/api/courses` | Course | ADMIN | Create course |
| PUT | `/api/courses/{id}` | Course | ADMIN | Replace/update course |
| DELETE | `/api/courses/{id}` | Course | ADMIN | Delete course |
| POST | `/api/courses/{id}/reviews` | Course | JWT + completed enrollment | Create review |
| GET | `/api/instructors` | InstructorPublic | Public | List instructors |
| GET | `/api/instructors/{id}` | InstructorPublic | Public | Instructor detail |
| GET | `/api/enrollments/me` | Enrollment | JWT | Current enrollments |
| POST | `/api/enrollments` | Enrollment | JWT + STUDENT check | Enroll |
| GET | `/api/enrollments/{courseId}/content` | Enrollment | enrolled/owner/admin | Full lesson content |
| PATCH | `/api/enrollments/{courseId}` | Enrollment | JWT + enrollment ownership | Progress only |
| PATCH | `/api/enrollments/admin/{id}` | Enrollment | ADMIN | Admin enrollment update |
| POST | `/api/enrollments/{courseId}/lessons/{lessonId}/submit` | Enrollment | JWT + enrollment | Submit lesson |
| POST | `/api/enrollments/{courseId}/submit-for-grading` | Enrollment | JWT + complete progress | Final request |
| GET | `/api/cart` | Cart | JWT | Current cart |
| POST | `/api/cart` | Cart | JWT + STUDENT | Add course |
| DELETE | `/api/cart/{courseId}` | Cart | JWT + owner scope | Remove course |
| POST | `/api/cart/checkout` | Cart | JWT + STUDENT | Demo checkout |
| GET | `/api/certificates/me` | Certificate | JWT | Current certificates |
| GET | `/api/certificates/{courseId}` | Certificate | JWT + owner scope | One certificate |
| GET | `/api/notifications` | Notification | JWT | Current notifications |
| PATCH | `/api/notifications/{id}/read` | Notification | JWT + owner scope | Mark read |
| GET | `/api/users/me` | User | JWT | Current profile |
| PATCH | `/api/users/me` | User | JWT | Name/avatar update |
| POST | `/api/activity/log` | Activity | JWT | Add study minutes |
| GET | `/api/activity/weekly` | Activity | JWT | Seven-day activity |
| GET | `/api/instructor/courses` | Instructor | INSTRUCTOR | Owned courses |
| GET | `/api/instructor/submissions` | Instructor | INSTRUCTOR + owned courses | Submissions |
| PATCH | `/api/instructor/submissions/{id}` | Instructor | INSTRUCTOR + course owner | Grade |
| GET | `/api/admin/health` | Admin | ADMIN | Admin authorization check |
| GET | `/api/admin/stats` | Admin | ADMIN | Summary statistics |
| GET | `/api/admin/students-report` | Admin | ADMIN | Student report |
| PUT/DELETE | `/api/admin/students/{id}` | Admin | ADMIN | Update/delete student |
| GET | `/api/admin/submissions` | Admin | ADMIN | All/filter submissions |
| PATCH | `/api/admin/submissions/{id}` | Admin | ADMIN | Grade submission |
| POST | `/api/admin/instructors` | Admin | ADMIN | Create instructor/user |
| PUT/DELETE | `/api/admin/instructors/{id}` | Admin | ADMIN | Update/delete instructor |
| POST | `/api/admin/instructors/sync` | Admin | ADMIN + strong supplied password | Repair instructor users |

API weaknesses still present: no pagination contract, inconsistent use of DTO versus `Map`, no API versioning, no formal response schema/OpenAPI, and no rate limiting.

## 8. Bugs Found

### Critical

1. Severity: CRITICAL  
File/function: `EnrollmentController.updateProgress` (before fix)  
Problem/cause: trusted client fields `completed` and `grade`; a student could set grade 100.  
Impact: forged completion and certificate.  
Reproduce: authenticated student sent `PATCH /api/enrollments/{courseId}` with `{"completed":true,"grade":100}`.  
Fix: implemented—endpoint rejects grader-owned fields; grading is centralized and owner-authorized.

2. Severity: CRITICAL  
File: `application.properties`, `DataSeeder` (before fix)  
Problem: real-looking DB password, fixed JWT secret, predictable admin password and password log.  
Impact: database/admin/token compromise if reused/deployed.  
Reproduce: read repository/config or application logs.  
Fix: implemented—environment variables, seed disabled by default, strong supplied password, no password logging. Existing exposed secrets must still be rotated.

### High

1. `CourseController.toMap`: public API exposed video/document/exercise content and quiz answers. Anyone could request `/api/courses`. Fixed with public curriculum projection and protected content endpoint.
2. `InstructorController.getAccessibleCourseIds`: category/specialty matching let instructors grade other instructors' courses. Fixed to `findByInstructorId` and regression-tested.
3. `Cart.handleCheckout`: Promise was not awaited; UI displayed success after rejected requests and generated unhandled rejection. Fixed with awaited flow and visible error state.
4. Checkout/enrollment: there is no payment provider, signed order, transaction record or webhook idempotency. Still open; UI/API now explicitly identify demo mode.
5. Final grading: grading any lesson submission marked the whole course complete. Fixed: only `course_completion` grading completes enrollment/certificate flow.

### Medium

- Enrollment accepted missing course IDs and produced FK/500 errors. Fixed with 404 validation.
- Submission accepted fake lesson IDs, empty/very large content and duplicates. Fixed at application level.
- Review accepted invalid/missing rating and repeat reviews; exceptions exposed messages. Fixed.
- Course create accepted client IDs and could overwrite an existing row through `save`. Fixed by server UUID and payload validation.
- OAuth put JWT in query string and had no frontend route. Fixed with fragment plus redirect handler; live provider flow remains unverified.
- Direct reload of `Learn` could initialize an empty current lesson before async data arrived. Fixed with loading/content effects.
- UI looked up instructors only from static mock data. Fixed to use API-backed context.
- Certificate identifier hardcoded year 2024. Fixed to use completion/current year.
- Admin instructor deletion could violate course FK and return 500. Fixed with 404/409 guard.
- Admin/student/instructor mutable inputs had weak email/password checks. Partially fixed; DTO conversion remains recommended.
- API errors were inconsistent and data-integrity errors became verbose 500s. Fixed with global JSON exception handling and security 401/403 bodies.

### Low

- Redundant `/api/auth/health` and `/api/admin/health` endpoints.
- Unused imports/variables and many `as any` casts.
- `UserActivityController` declares an unused day-name array.
- UI footer links use `href="#"` placeholders.
- Some frontend failures are still intentionally swallowed, especially activity and grading-request refresh paths.

## 9. Security Issues

Fixed: hardcoded secrets/default admin, self-grading, public course-content disclosure, instructor horizontal privilege escalation, invalid lesson submission, broad controller CORS override, OAuth token query leakage, inconsistent auth errors.

Remaining:

- Real payment is absent; current checkout must never be treated as proof of payment.
- JWT in `localStorage` is exposed to any future XSS; there is no refresh, revocation, rotation or account-disable field.
- Login/register have no rate limiting, lockout, CAPTCHA or email verification.
- OAuth provider configuration and state/callback behavior were not integration-tested.
- Public instructor API exposes email addresses.
- Admin-configured image/iframe URLs need a formal allowlist/CSP. Learn now permits only recognized YouTube hosts for iframe rendering.
- No dependency/SBOM/SAST/secret-scanning CI is configured.

SQL injection risk is low in reviewed paths because Spring Data parameter binding is used. React escapes rendered text, and no application page uses raw HTML injection. CSRF is disabled consistently with bearer-token stateless API use; changing to cookie auth requires CSRF protection.

## 10. Performance Issues

- `/api/admin/stats` repeatedly loads all enrollments/courses and calls `findById` inside loops (N+1) for revenue/monthly calculations.
- instructor listing performs course query per instructor and count query per course.
- admin/instructor submission mapping queries user and course per submission.
- student report calls `findByUserId` twice per student.
- catalog returns every course and frontend performs most filtering/sorting; no pagination.
- JSON course blobs force full chapter/review payload parsing and updates.
- Production frontend main chunk remains approximately 928 KB minified (~252 KB gzip); routes are eagerly imported. PDF libraries are dynamically imported, but route-level code splitting is absent.
- Remote images lack a coherent optimization/size policy.

Recommended: aggregate repository queries/projections, server pagination/filtering, batch-fetch maps, database indexes, React route lazy loading, and bundle dependency review.

## 11. Code Quality Issues

- Large files: `ManageCourses.tsx`, `Learn.tsx`, `AppContext.tsx`, and `AdminController.java` combine multiple responsibilities.
- Controllers frequently accept raw maps and perform casts. Typed request DTOs should replace them incrementally.
- Business rules were duplicated between admin/instructor grading; this audit extracted the critical transaction to `GradingService`.
- Course content is stored as untyped JSON and frontend uses many `as any` casts.
- Mock fallback data is coupled to production state and can conceal outages.
- There is no OpenAPI contract, frontend lint/typecheck script, formatter enforcement or CI.

## 12. Changes Implemented

| File/area | Change | Reason / impact |
|---|---|---|
| Enrollment controller/repository | ownership/content/progress/lesson/duplicate validation; UUID IDs | closes self-grade, IDOR/content and bad-FK paths |
| Course controller/mapper | public projection, protected content, course/review validation | protects intellectual property/answers and data integrity |
| Instructor controller | course ownership authorization | prevents horizontal privilege escalation |
| `GradingService` | shared validated grading transaction | consistent enrollment/certificate/notification behavior |
| Admin controller | grading service, email/password/delete guards | prevents invalid grades/conflicts |
| Cart controller | role/course/duplicate checks, awaited-compatible response, demo marker | avoids 500s and false assumptions |
| Security/OAuth | JSON 401/403, configured CORS only, token fragment | safer auth behavior |
| Configuration/seeder | all secrets external; admin seed opt-in | removes committed/default credentials |
| Frontend context/learn/cart | protected content fetch, progress payload fix, rollback, awaited checkout/errors | correct frontend-backend integration |
| Frontend data usage | API-backed instructors, OAuth route, dynamic certificate year | fixes stale/mock behavior |
| Tests | six controller/mapper regression tests | locks high-risk fixes |
| `.env.example`, `.gitignore`, README | complete setup/security/run docs | reproducible and safer onboarding |

## 13. Remaining Issues

Must not be claimed production-ready until these are handled:

1. Integrate a real payment provider. Store immutable order line prices, verify signed server-to-server result/webhook, make webhook idempotent, and create enrollment in the same transaction/outbox workflow.
2. Add Flyway/Liquibase before schema evolution; add indexes/checks and reconcile denormalized counters.
3. Implement server-side quiz attempts, deadlines, allowed attempts, answer validation and scoring. Do not trust browser-computed results.
4. Add integration tests with MySQL/Testcontainers and authorization tests through Spring Security/MockMvc.
5. Add rate limiting and production session/token lifecycle.

Other deferred improvements: pagination/N+1 fixes, course draft/published state, account disable state, public instructor email policy, frontend E2E tests, route lazy loading, centralized typed API contracts, Docker/CI/CD, logging/metrics/tracing, and removal/quarantine of mock fallback in production builds.

## 14. How To Run Online Course System

See the root `README.md` for requirements, all environment variables, database setup, backend/frontend commands, startup order and troubleshooting. Essential order is MySQL → backend on 8080 → frontend on 5173. `JWT_SECRET` and database credentials must be supplied externally.

The local MySQL 8 service was detected as running, but schema/data integration could not be inspected because no authorized database credential was supplied to the audit process. No secret from the old source was reused in a command.

## 15. Quick Start

```text
1. Install JDK 17, Maven 3.8+, MySQL 8, Node 18+/npm 9+.
2. Import backend-spring/schema.sql.
3. Set DB_USER, DB_PASSWORD and a random JWT_SECRET.
4. cd backend-spring && mvn spring-boot:run
5. From root: npm install && npm run dev
6. Open http://localhost:5173; health is http://localhost:8080/api/health.
```

## 16. Testing

Commands executed:

| Command | Result | Passed | Failed | Notes |
|---|---|---:|---:|---|
| `mvn test` | Success | 6 | 0 | controller authorization/data tests and response redaction |
| `mvn package` | Success | 6 | 0 | executable JAR generated successfully |
| `npm run build` | Success | build | 0 | Vite warns that main chunk exceeds 500 KB |

Not executed as verified integration: live Spring API startup, database queries/data audit, OAuth provider callback, browser E2E, or payment (none exists). The blocker is missing authorized DB/provider configuration, not compilation.

Minimum additional tests:

- Auth: duplicate/case-normalized email, invalid password, role enforcement, expired/tampered JWT.
- Course: DTO validation, update/delete FK conflict, public/admin/enrolled projections.
- Enrollment: concurrent duplicate request, free/paid policy, valid/invalid progress and ownership.
- Lesson/quiz: membership, attempt limits, score/deadline validation.
- Admin: every mutation under student/instructor tokens must return 403.
- Integration: MySQL constraints/cascades and grading transaction rollback.
- Frontend/E2E: login redirects, failed checkout, direct learn reload, OAuth redirect, admin/instructor guards.

## 17. Troubleshooting

The root README includes cause/diagnosis/fix for DB refusal/access denied, missing JWT secret, port conflicts, CORS, 401/403, OAuth setup, fallback data and missing Maven. Important distinction: a UI catalog populated from fallback mock data does not prove backend/database health; always check `/api/health`, `/api/courses`, and browser Network responses.

## 18. Recommended Improvements

### Must Fix

- Real, verified, idempotent payment or remove all payment claims.
- Rotate the previously exposed DB password/JWT secret anywhere they were used.
- Versioned migrations plus constraints/indexes.
- Server-side quiz/assessment integrity.
- Rate limiting and broader auth/integration test coverage.

### Should Fix

- Repository aggregate queries and pagination.
- Typed request/response DTOs and OpenAPI-generated frontend types.
- Production-safe auth storage/refresh/revocation.
- Course publication state and account disable state.
- CI pipeline: compile, unit/integration/E2E, dependency/SAST/secret scanning.
- Remove public instructor email unless explicitly required.

### Nice To Have

- Route-level lazy loading and bundle trimming.
- Docker Compose for MySQL/backend/frontend after migration and health checks exist.
- Split large React pages/context and admin controller by feature.
- Structured observability and audit logs for admin/grading/payment actions.
- Dedicated media/object storage with signed URLs if uploads are added.

## 19. Final Health Score

Scores reflect the repository after the implemented fixes, while payment/database integration remain unverified.

```text
Architecture:          6.0/10
Backend:               6.5/10
Frontend:              6.0/10
Database:              5.5/10
Security:              6.0/10
Performance:           4.5/10
Code Quality:          5.5/10
Maintainability:       5.5/10
Deployment readiness:  4.0/10

Overall:               5.5/10
```

Rationale: the core stack is understandable and compiles, key relationships exist, and the most exploitable authorization/secrets bugs were fixed and tested. The score is capped by simulated payment, no migrations, limited test coverage, no pagination/aggregate queries, no CI/container deployment path, incomplete assessment integrity, and lack of live database/OAuth/E2E verification.
