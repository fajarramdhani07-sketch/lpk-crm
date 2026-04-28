# Backend Undone Tweaks

These items are intentionally left for later because the current implementation focuses on the database-backed REST foundation.

## Deployment and Environment

- Install/start a real PostgreSQL database locally or in the cloud, then point `DATABASE_URL` to it.
- Current local check: `127.0.0.1:5432` is not accepting TCP connections, so `npm run db:migrate` cannot complete yet.
- Set a long random `BETTER_AUTH_SECRET` in each environment.
- Set `BETTER_AUTH_URL` to the deployed app URL.
- Run `npm run db:migrate` and `npm run db:seed` after the database is available.

## Frontend Integration

- Finish browser verification of Better Auth login after PostgreSQL is running and seeded.
- Remove the remaining fallback mock path inside `components/candidate-portal-rebuilt.tsx` after real database usage is confirmed.
- Remove legacy unused candidate form code from `components/lpk-crm-app.tsx` after the real backend flow is stable.
- Add a small loading/empty state polish pass for the admin dashboard once the real API has no rows.

## File Storage

- Replace mock file references with S3/GCS signed upload URLs.
- Store real `storageKey`, `mimeType`, and `sizeBytes`.
- Add file download authorization checks.
- Add cleanup for soft-deleted files in object storage.

## CV Generation

- Add a real worker process for pending `CvJob` rows.
- Generate Bahasa Indonesia and Bahasa Jepang CV files.
- Upload generated CVs to storage and attach them to `CandidateFile`.
- Add retry/backoff handling for failed jobs.

## Validation and Operations

- Mirror the full frontend final-submit validation rules on the backend.
- Add pagination and stricter filter validation for large candidate lists.
- Add admin endpoints for configurable options like LPK origins, majors, job roles, relations, and occupations.
- Add automated tests for auth, candidate updates, audit logs, latest test-result constraints, and soft deletes.
- Add audit retention cleanup for the PRD default of 90 days.
