# API Documentation

Base URL: `/api`

All request bodies are JSON. Validation errors return `400` with an `error` message.

## Authentication

### `POST /api/auth/login`

Signs in a resident or admin and sets an HTTP-only session cookie.

```json
{
  "email": "admin@residentflow.ai",
  "password": "Password123!"
}
```

### `POST /api/auth/register`

Creates a resident account and signs the resident in.

```json
{
  "name": "Aarav Mehta",
  "email": "resident@example.com",
  "password": "Password123!",
  "flatNumber": "A-1204",
  "phone": "+91 90000 00001"
}
```

### `POST /api/auth/logout`

Deletes the active session and clears the session cookie.

### `GET /api/auth/[...all]`

Handled by Better Auth through `toNextJsHandler(auth)`.

### `POST /api/auth/[...all]`

Handled by Better Auth. Supports email and password configuration from `lib/auth.ts`.

## Complaints

### `POST /api/complaints`

Creates a complaint and its first history record.

JSON request:

```json
{
  "title": "Water leaking from bathroom",
  "description": "Water is dripping from the ceiling near the exhaust.",
  "category": "PLUMBING",
  "priority": "HIGH",
  "location": "Tower A, Flat 1204"
}
```

Multipart form data also supports a `photo` file field for complaint image upload. Cloudinary environment variables must be configured for uploads.

Response:

```json
{
  "complaint": {
    "id": "cuid",
    "title": "Water leaking from bathroom",
    "status": "OPEN",
    "priority": "HIGH",
    "category": "PLUMBING",
    "createdAt": "2026-06-29T00:00:00.000Z"
  }
}
```

### `GET /api/complaints?duplicateOf=TEXT`

Returns active complaints with a similarity score for duplicate detection.

Response:

```json
{
  "duplicates": [
    {
      "id": "cuid",
      "title": "Water leaking from bathroom ceiling",
      "description": "Water is dripping continuously...",
      "status": "IN_PROGRESS",
      "createdAt": "2026-06-29T00:00:00.000Z",
      "score": 0.62
    }
  ]
}
```

### `PATCH /api/complaints/status`

Updates complaint status and creates a history record transactionally.

Request:

```json
{
  "complaintId": "cuid",
  "status": "RESOLVED",
  "note": "Vendor completed the fix."
}
```

When Resend is configured, the resident receives a status-change email.

### `POST /api/complaints/rating`

Residents rate a resolved complaint. The complaint is then closed and a history record is written.

```json
{
  "complaintId": "cuid",
  "score": 5,
  "comment": "Resolved quickly"
}
```

### `POST /api/complaints/follow`

Residents follow an existing duplicate complaint.

```json
{
  "complaintId": "cuid"
}
```

## Notices

### `POST /api/notices`

Creates a notice. If `important` is true and Resend is configured, residents are emailed.

Request:

```json
{
  "title": "Water supply maintenance",
  "body": "Water supply will be paused from 10 AM to 12 PM.",
  "pinned": true,
  "important": true
}
```

## Settings

### `PATCH /api/settings/overdue`

Admin-only endpoint to configure overdue detection.

```json
{
  "days": 3
}
```

Response:

```json
{
  "notice": {
    "id": "cuid",
    "title": "Water supply maintenance",
    "body": "Water supply will be paused from 10 AM to 12 PM.",
    "pinned": true,
    "important": true
  }
}
```
