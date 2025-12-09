# Podcast Reservation System - Admin Frontend API Specification

**Document Version:** 2.4  
**Last Updated:** 2025-11-21 12:20  
**API Version:** v1

---

## Overview

This document provides complete API specifications for the **admin-side podcast reservation management system**. All endpoints require admin authentication.

### ⚠️ Important Changes (v2.0)

This system uses **fixed-duration bookings** with the following constraints:

- ✅ All reservations are in **whole hours** (1h, 2h, 3h, etc.)
- ✅ Duration is **NOT** tied to packs - clients select hours directly
- ✅ Times must be on the hour (09:00, 10:00, 11:00, etc.)
- ✅ All datetime fields use **ISO 8601** format with timezone
- ✅ Calendar has separate feeds for **pending** and **confirmed** reservations

---

## Base URLs

- **v1 Admin API:** `/api/v1/admin`
- **Authentication:** Bearer token in `Authorization` header
- **Required Role:** `admin`

```http
Authorization: Bearer <admin-jwt-token>
```

---

## Table of Contents

### Admin Endpoints (v1)
1. [Create Reservation](#1-create-reservation-admin)
2. [Get Reservation Details](#2-get-reservation-details)
3. [Update Schedule (Drag & Drop)](#3-update-schedule-drag--drop)
4. [Update Status](#4-update-status)
5. [Get Confirmed Calendar](#5-get-confirmed-calendar)
6. [Get Pending Calendar](#6-get-pending-calendar)
7. [List Reservations](#7-list-reservations)
8. [Delete Reservation](#8-delete-reservation)
9. [Add Note to Reservation](#9-add-note-to-reservation)
10. [Get Client Reservation Data](#10-get-client-reservation-data)
11. [Get Available Decors](#11-get-available-decors)
12. [Get Available Packs](#12-get-available-packs)
13. [Get Available Supplements](#13-get-available-supplements)

### Reference
14. [Shared Response Examples](#shared-response-examples)
15. [Error Responses](#error-responses)
16. [Workflow Examples](#workflow-examples)

---

## 1. Create Reservation (Admin)

Create a reservation directly from the admin panel. Used for phone bookings, manual entries, or calendar-based creation.

### Endpoint
```
POST /api/v1/admin/reservations/podcast
```

### Authentication
✅ Required (Admin only)

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `startAt` | string (ISO 8601) | ✅ Yes | Start datetime with timezone |
| `endAt` | string (ISO 8601) | ✅ Yes | End datetime with timezone |
| `timezone` | string | No | Timezone (default: `Europe/Paris`) |
| `status` | string | No | `pending` or `confirmed` (default: `confirmed`) |
| `customerName` | string | ✅ Yes | Customer full name |
| `customerEmail` | string | ✅ Yes | Customer email |
| `customerPhone` | string | No | Customer phone number |
| `decorId` | string (UUID) | No | Selected décor option |
| `packOfferId` | string (UUID) | No | Selected pack (optional) |
| `themeId` | string (UUID) | Conditional | Selected theme ID |
| `customTheme` | string | Conditional | Custom theme name |
| `podcastDescription` | string | No | Description of the podcast |
| `supplementIds` | array[UUID] | No | Selected supplements |
| `assignedAdminId` | string (UUID) | No | Admin assigned to handle |
| `notes` | string | No | Admin notes |
| `answers` | array | No | Form question answers |

**Duration Validation:**
- `endAt - startAt` must be a whole number of hours (1h, 2h, 3h, etc.)
- Both `startAt` and `endAt` must be on the hour (minutes = 00)

### Request Example

**Create 2-hour confirmed reservation:**

```http
POST /api/v1/admin/reservations/podcast
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "startAt": "2025-11-20T10:00:00+01:00",
  "endAt": "2025-11-20T12:00:00+01:00",
  "status": "confirmed",
  "customerName": "Alice Dubois",
  "customerEmail": "alice.dubois@example.com",
  "customerPhone": "+33612345678",
  "decorId": "decor-770e8400-e29b-41d4",
  "themeId": "theme-110e8400-e29b-41d4",
  "podcastDescription": "A tech podcast",
  "supplementIds": ["supp-990e8400-e29b-41d4"],
  "assignedAdminId": "admin-abc123-e29b-41d4",
  "notes": "Phone booking. Customer prefers morning slots.",
  "answers": [
    {
      "questionId": "quest-bb0e8400-e29b-41d4",
      "answerText": "The Growth Lab Podcast"
    }
  ]
}
```

### Success Response

**Status Code:** `201 Created`

```json
{
  "success": true,
  "data": {
    "reservation": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "confirmationId": "CONF-2025-0042",
      "status": "confirmed",
      "startAt": "2025-11-20T10:00:00.000+01:00",
      "endAt": "2025-11-20T12:00:00.000+01:00",
      "calendarStart": "2025-11-20T09:00:00.000Z",
      "calendarEnd": "2025-11-20T11:00:00.000Z",
      "durationHours": 2,
      "timezone": "Europe/Paris",
      "themeId": "theme-110e8400-e29b-41d4",
      "customTheme": null,
      "podcastDescription": "A tech podcast",
      "customerName": "Alice Dubois",
      "customerEmail": "alice.dubois@example.com",
      "customerPhone": "+33612345678",
      "totalPrice": 280.00,
      "assignedAdminId": "admin-abc123-e29b-41d4",
      "createdAt": "2025-11-16T08:30:22.123Z",
      "confirmedAt": "2025-11-16T08:30:22.123Z"
    }
  }
}
```

### Error Responses

**Invalid Duration (90 minutes = 1.5 hours):**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Reservation duration must be a whole number of hours.",
    "details": [
      {
        "field": "endAt",
        "message": "Duration must be a positive multiple of 60 minutes (1h, 2h, 3h, ...)."
      }
    ]
  }
}
```

**Time Not On The Hour:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Start and end times must be on the hour (00 minutes)."
  }
}
```

**Slot Already Booked:**

```json
{
  "success": false,
  "error": {
    "code": "SLOT_ALREADY_BOOKED",
    "message": "The selected time slot is no longer available"
  }
}
```

---

## 2. Get Reservation Details

Retrieve complete details for a specific reservation including customer info, supplements, and form answers.

### Endpoint
```
GET /api/v1/admin/reservations/podcast/:id
```

### Authentication
✅ Required (Admin only)

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | ✅ Yes | Reservation ID |

### Request Example

```http
GET /api/v1/admin/reservations/podcast/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "confirmationId": "CONF-2025-0042",
    "status": "confirmed",
    "startAt": "2025-11-20T10:00:00.000+01:00",
    "endAt": "2025-11-20T12:00:00.000+01:00",
    "calendarStart": "2025-11-20T09:00:00.000Z",
    "calendarEnd": "2025-11-20T11:00:00.000Z",
    "durationHours": 2,
    "timezone": "Europe/Paris",
    "theme": {
      "id": "theme-110e8400-e29b-41d4",
      "name": "Technology",
      "description": "Tech focused theme"
    },
    "customTheme": null,
    "podcastDescription": "A tech podcast",
    "decor": {
      "id": "decor-770e8400-e29b-41d4",
      "name": "Urban Loft",
      "imageUrl": "https://cdn.example.com/decor/urban-loft.jpg"
    },
    "packOffer": {
      "id": "pack-880e8400-e29b-41d4",
      "name": "Premium Recording",
      "basePrice": 200.00
    },
    "supplements": [
      {
        "id": "supp-990e8400-e29b-41d4",
        "name": "Professional Editing",
        "priceAtBooking": 80.00
      }
    ],
    "customer": {
      "name": "Alice Dubois",
      "email": "alice.dubois@example.com",
      "phone": "+33612345678"
    },
    "answers": [
      {
        "questionId": "quest-bb0e8400-e29b-41d4",
        "fieldName": "podcast_name",
        "label": "What is your podcast name?",
        "value": "The Growth Lab Podcast"
      },
      {
        "questionId": "quest-cc0e8400-e29b-41d4",
        "fieldName": "episode_type",
        "label": "Episode type",
        "value": ["interview", "solo"]
      }
    ],
    "notes": "Phone booking. Customer prefers morning slots.",
    "totalPrice": 280.00,
    "assignedAdminId": "admin-abc123-e29b-41d4",
    "confirmedByAdminId": "admin-abc123-e29b-41d4",
    "createdAt": "2025-11-16T08:30:22.123Z",
    "updatedAt": "2025-11-16T08:30:22.123Z",
    "confirmedAt": "2025-11-16T08:30:22.123Z"
  }
}
```

### Error Responses

**Reservation Not Found:**

```json
{
  "success": false,
  "error": {
    "code": "RESERVATION_NOT_FOUND",
    "message": "Reservation not found"
  }
}
```

---

## 3. Update Schedule (Drag & Drop)

Update the time slot of a reservation. Used for calendar drag-and-drop operations or manual rescheduling.

### Endpoint
```
PATCH /api/v1/admin/reservations/podcast/:id/schedule
```

### Authentication
✅ Required (Admin only)

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | ✅ Yes | Reservation ID |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `startAt` | string (ISO 8601) | ✅ Yes | New start datetime |
| `endAt` | string (ISO 8601) | ✅ Yes | New end datetime |
| `timezone` | string | No | New timezone |
| `keepStatus` | boolean | No | Keep current status (default: `true`) |
| `status` | string | No | New status if `keepStatus = false` |
| `reason` | string | No | Reason for rescheduling |

**Validation:**
1. Duration must be whole hours
2. Slot must be available (no conflicts with confirmed reservations)
3. Reservation must not be `cancelled` or `completed`

### Request Example

**Drag 2-hour reservation to new time:**

```http
PATCH /api/v1/admin/reservations/podcast/550e8400-e29b-41d4-a716-446655440000/schedule
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "startAt": "2025-11-20T14:00:00+01:00",
  "endAt": "2025-11-20T16:00:00+01:00",
  "keepStatus": true,
  "reason": "Customer requested afternoon slot"
}
```

**Resize reservation to 3 hours:**

```http
PATCH /api/v1/admin/reservations/podcast/550e8400-e29b-41d4-a716-446655440000/schedule
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "startAt": "2025-11-20T10:00:00+01:00",
  "endAt": "2025-11-20T13:00:00+01:00",
  "reason": "Extended session requested"
}
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "data": {
    "reservation": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "confirmed",
      "startAt": "2025-11-20T14:00:00.000+01:00",
      "endAt": "2025-11-20T16:00:00.000+01:00",
      "calendarStart": "2025-11-20T13:00:00.000Z",
      "calendarEnd": "2025-11-20T15:00:00.000Z",
      "durationHours": 2,
      "updatedAt": "2025-11-16T09:15:30.456Z"
    }
  }
}
```

### Error Responses

**Slot Conflict:**

```json
{
  "success": false,
  "error": {
    "code": "SLOT_ALREADY_BOOKED",
    "message": "The selected time slot is no longer available"
  }
}
```

**Invalid Duration:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Duration must be whole hours (1h, 2h, 3h, ...)."
  }
}
```

**Reservation Not Editable:**

```json
{
  "success": false,
  "error": {
    "code": "RESERVATION_NOT_EDITABLE",
    "message": "Cannot modify completed or cancelled reservations"
  }
}
```

---

## 4. Update Status

Change the status of a reservation (e.g., pending → confirmed, confirmed → cancelled).

### Endpoint
```
PATCH /api/v1/admin/reservations/podcast/:id/status
```

### Authentication
✅ Required (Admin only)

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | ✅ Yes | Reservation ID |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | ✅ Yes | New status: `pending`, `confirmed`, `cancelled`, `rejected`, `completed` |
| `notes` | string | No | Additional notes |

**Status Transitions:**
- `pending` → `confirmed` (generates confirmation ID, checks availability)
- `confirmed` → `cancelled` (frees up time slot)
- `confirmed` → `completed` (marks as done)
- `pending` → `rejected` (declines request)

### Request Example

**Confirm a pending reservation:**

```http
PATCH /api/v1/admin/reservations/podcast/550e8400-e29b-41d4-a716-446655440000/status
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "status": "confirmed",
  "notes": "Confirmed via phone call with customer"
}
```

**Cancel a confirmed reservation:**

```http
PATCH /api/v1/admin/reservations/podcast/550e8400-e29b-41d4-a716-446655440000/status
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "status": "cancelled",
  "notes": "Customer requested cancellation"
}
```

### Success Response

**Status Code:** `200 OK`

**When confirming (generates confirmation ID):**

```json
{
  "success": true,
  "data": {
    "reservation": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "confirmationId": "CONF-2025-0043",
      "status": "confirmed",
      "confirmedAt": "2025-11-16T09:30:45.789Z",
      "updatedAt": "2025-11-16T09:30:45.789Z"
    }
  }
}
```

**When cancelling:**

```json
{
  "success": true,
  "data": {
    "reservation": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "cancelled",
      "updatedAt": "2025-11-16T09:35:20.123Z"
    }
  }
}
```

### Error Responses

**Cannot Confirm (Invalid Duration):**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Cannot confirm: duration is not a whole number of hours"
  }
}
```

**Slot No Longer Available:**

```json
{
  "success": false,
  "error": {
    "code": "SLOT_ALREADY_BOOKED",
    "message": "Time slot no longer available"
  }
}
```

---

## 5. Get Confirmed Calendar

Retrieve all confirmed reservations for display in the admin calendar.

### Endpoint
```
GET /api/v1/admin/reservations/podcast/calendar/confirmed
```

### Authentication
✅ Required (Admin only)

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string (YYYY-MM-DD) | No | Filter by specific date |

- If `date` is provided: returns reservations for that single day
- If `date` is omitted: returns next 30 days of confirmed reservations

### Request Example

**Get confirmed reservations for a specific date:**

```http
GET /api/v1/admin/reservations/podcast/calendar/confirmed?date=2025-11-20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Get upcoming confirmed reservations (default):**

```http
GET /api/v1/admin/reservations/podcast/calendar/confirmed
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "confirmationId": "CONF-2025-0042",
      "status": "confirmed",
      "calendarStart": "2025-11-20T09:00:00.000Z",
      "calendarEnd": "2025-11-20T11:00:00.000Z",
      "durationHours": 2,
      "customerName": "Alice Dubois",
      "customerEmail": "alice.dubois@example.com",
      "notes": "Phone booking. Customer prefers morning slots.",
      "assignedAdminId": "admin-abc123-e29b-41d4"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "confirmationId": "CONF-2025-0043",
      "status": "confirmed",
      "calendarStart": "2025-11-20T13:00:00.000Z",
      "calendarEnd": "2025-11-20T16:00:00.000Z",
      "durationHours": 3,
      "customerName": "Bob Martin",
      "customerEmail": "bob.martin@example.com",
      "notes": null,
      "assignedAdminId": null
    }
  ]
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `calendarStart` | string (ISO 8601) | UTC datetime for calendar display |
| `calendarEnd` | string (ISO 8601) | UTC datetime for calendar display |
| `durationHours` | number | Duration in hours (for visual sizing) |

**Calendar Display Notes:**
- Use `calendarStart` and `calendarEnd` for positioning events
- Multi-hour events span multiple hour rows
- All times in UTC for consistent calendar rendering

---

## 6. Get Pending Calendar

Retrieve all pending reservations awaiting admin review.

### Endpoint
```
GET /api/v1/admin/reservations/podcast/calendar/pending
```

### Authentication
✅ Required (Admin only)

### Query Parameters

Same as [Get Confirmed Calendar](#5-get-confirmed-calendar)

### Request Example

```http
GET /api/v1/admin/reservations/podcast/calendar/pending
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "confirmationId": null,
      "status": "pending",
      "calendarStart": "2025-11-21T08:00:00.000Z",
      "calendarEnd": "2025-11-21T09:00:00.000Z",
      "durationHours": 1,
      "customerName": "Claire Dupont",
      "customerEmail": "claire.dupont@example.com",
      "notes": "First time podcast recording",
      "assignedAdminId": null
    }
  ]
}
```

**UI Recommendations:**
- Display pending reservations in a different color (e.g., yellow/orange)
- Show "Awaiting Confirmation" badge
- Provide quick actions: Confirm, Reschedule, Reject

---

## 7. List Reservations

⭐ **IMPLEMENTED** - This endpoint exists in the current backend implementation.

Retrieve a paginated list of all podcast reservations with filtering and sorting options.

### Endpoint
```
GET /api/v1/admin/reservations/podcast
```

### Authentication
✅ Required (Admin only)

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 10) |
| `status` | string | No | Filter by status: `pending`, `confirmed`, `completed`, `cancelled` |
| `search` | string | No | Search by confirmation ID or client info |
| `sortBy` | string | No | Field to sort by |
| `order` | string | No | Sort order: `asc` or `desc` (default: `desc`) |
| `dateFrom` | string (ISO 8601) | No | Filter reservations from this date |
| `dateTo` | string (ISO 8601) | No | Filter reservations until this date |

### Request Example

**Get pending reservations, page 1:**

```http
GET /api/v1/admin/reservations/podcast?status=pending&page=1&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Search for specific reservation:**

```http
GET /api/v1/admin/reservations/podcast?search=CONF-2025-0042
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Get reservations in date range:**

```http
GET /api/v1/admin/reservations/podcast?dateFrom=2025-11-20&dateTo=2025-11-30&order=asc
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "data": {
    "reservations": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "clientId": "client-abc123-e29b-41d4",
        "confirmationId": "CONF-2025-0042",
        "status": "pending",
        "submittedAt": "2025-11-16T08:30:22.123Z"
      },
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "clientId": "client-def456-e29b-41d4",
        "confirmationId": "CONF-2025-0043",
        "status": "confirmed",
        "submittedAt": "2025-11-15T14:20:10.456Z"
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

**Notes:**
- This is a simplified list view for admin dashboard tables
- For full details including customer info and answers, use [Get Reservation Details](#2-get-reservation-details)
- For calendar-optimized view, use [Get Confirmed Calendar](#5-get-confirmed-calendar) or [Get Pending Calendar](#6-get-pending-calendar)

---

## 8. Delete Reservation

⭐ **IMPLEMENTED** - This endpoint exists in the current backend implementation.

Permanently delete a reservation from the system. Use with caution - this action cannot be undone.

### Endpoint
```
DELETE /api/v1/admin/reservations/podcast/:id
```

### Authentication
✅ Required (Admin only)

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | ✅ Yes | Reservation ID to delete |

### Request Example

```http
DELETE /api/v1/admin/reservations/podcast/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Success Response

**Status Code:** `200 OK` or `204 No Content`

```json
{
  "success": true,
  "message": "Reservation deleted successfully"
}
```

### Error Responses

**Reservation Not Found:**

```json
{
  "success": false,
  "error": {
    "code": "RESERVATION_NOT_FOUND",
    "message": "Reservation not found"
  }
}
```

**Notes:**
- Consider using status update to `cancelled` instead of deletion for audit trail
- Deletion removes all associated data including notes and status history
- This action is permanent and cannot be undone

---

## 9. Add Note to Reservation

⭐ **IMPLEMENTED** - This endpoint exists in the current backend implementation.

Add an internal admin note to a reservation for tracking communications, issues, or special requirements.

### Endpoint
```
POST /api/v1/admin/reservations/podcast/:id/notes
```

### Authentication
✅ Required (Admin only)

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | ✅ Yes | Reservation ID |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `noteText` | string | ✅ Yes | The note content (admin-only, not visible to client) |

### Request Example

```http
POST /api/v1/admin/reservations/podcast/550e8400-e29b-41d4-a716-446655440000/notes
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "noteText": "Client called to confirm microphone setup. Prefers lavalier mic."
}
```

### Success Response

**Status Code:** `201 Created`

```json
{
  "success": true,
  "data": {
    "note": {
      "id": "note-770e8400-e29b-41d4",
      "reservationId": "550e8400-e29b-41d4-a716-446655440000",
      "noteText": "Client called to confirm microphone setup. Prefers lavalier mic.",
      "createdBy": "admin-abc123-e29b-41d4",
      "createdAt": "2025-11-16T10:45:30.789Z"
    }
  }
}
```

### Error Responses

**Empty Note:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Note text is required"
  }
}
```

**Reservation Not Found:**

```json
{
  "success": false,
  "error": {
    "code": "RESERVATION_NOT_FOUND",
    "message": "Reservation not found"
  }
}
```

**Use Cases:**
- Track phone call communications
- Document special requests
- Note technical requirements
- Record follow-up actions needed
- Log issues or concerns

---

## 10. Get Client Reservation Data

⭐ **IMPLEMENTED** - This endpoint exists in the current backend implementation.

Retrieve all reservations associated with a specific client ID. Useful for viewing a client's reservation history.

### Endpoint
```
GET /api/v1/admin/reservations/podcast/client/:clientId
```

### Authentication
✅ Required (Admin only)

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `clientId` | UUID | ✅ Yes | Client ID to retrieve reservations for |

### Request Example

```http
GET /api/v1/admin/reservations/podcast/client/client-abc123-e29b-41d4
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "data": {
    "clientId": "client-abc123-e29b-41d4",
    "reservations": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "confirmationId": "CONF-2025-0042",
        "status": "confirmed",
        "submittedAt": "2025-11-16T08:30:22.123Z",
        "createdAt": "2025-11-16T08:30:22.123Z",
        "updatedAt": "2025-11-16T09:15:10.456Z"
      },
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "confirmationId": "CONF-2025-0038",
        "status": "completed",
        "submittedAt": "2025-11-10T14:20:15.789Z",
        "createdAt": "2025-11-10T14:20:15.789Z",
        "updatedAt": "2025-11-12T16:30:45.123Z"
      }
    ],
    "totalReservations": 2
  }
}
```

### Error Responses

**Client Not Found or No Reservations:**

```json
{
  "success": true,
  "data": {
    "clientId": "client-xyz789-e29b-41d4",
    "reservations": [],
    "totalReservations": 0
  }
}
```

**Use Cases:**
- View client reservation history
- Check for repeat customers
- Identify patterns or issues
- Support customer inquiries
- Verify client information

---

## 11. Get Available Decors

⭐ **NEWLY ADDED** - This endpoint provides the list of available podcast decor options for use in reservation creation and editing forms.

Retrieve all active decor options available for podcast reservations. Used to populate dropdown/select fields in admin reservation forms.

### Endpoint
```
GET /api/v1/admin/reservations/podcast/decors
```

### Authentication
✅ Required (Admin only)

### Query Parameters

None required.

### Request Example

```http
GET /api/v1/admin/reservations/podcast/decors
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "decor-770e8400-e29b-41d4",
      "name": "Urban Loft",
      "description": "Modern industrial-style decor with exposed brick",
      "imageUrl": "https://cdn.example.com/decor/urban-loft.jpg",
      "sortOrder": 1
    },
    {
      "id": "decor-880e8400-e29b-41d4",
      "name": "Minimalist White",
      "description": "Clean, minimalist white background",
      "imageUrl": "https://cdn.example.com/decor/minimalist-white.jpg",
      "sortOrder": 2
    },
    {
      "id": "decor-990e8400-e29b-41d4",
      "name": "Cozy Studio",
      "description": "Warm, intimate podcast studio setting",
      "imageUrl": "https://cdn.example.com/decor/cozy-studio.jpg",
      "sortOrder": 3
    }
  ]
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Unique decor identifier |
| `name` | string | Display name of the decor |
| `description` | string \| null | Detailed description |
| `imageUrl` | string \| null | URL to decor preview image |
| `sortOrder` | number | Display order (lower numbers first) |

### Error Responses

**Unauthorized:**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

**Forbidden:**

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Admin access required"
  }
}
```

**Use Cases:**
- Populate decor dropdown in reservation creation form
- Display available decor options when editing reservations
- Show decor previews with images
- Allow admins to select appropriate studio setup for customer

---

## 12. Get Available Packs

⭐ **NEWLY ADDED** - This endpoint provides the list of available podcast pack offers for use in reservation creation and editing forms.

Retrieve all active pack offers available for podcast reservations. Used to populate dropdown/select fields in admin reservation forms.

### Endpoint
```
GET /api/v1/admin/reservations/podcast/packs
```

### Authentication
✅ Required (Admin only)

### Query Parameters

None required.

### Request Example

```http
GET /api/v1/admin/reservations/podcast/packs
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "pack-880e8400-e29b-41d4",
      "name": "Basic Recording",
      "description": "Essential podcast recording package",
      "basePrice": 100.00,
      "durationMin": 60,
      "sortOrder": 1
    },
    {
      "id": "pack-990e8400-e29b-41d4",
      "name": "Premium Recording",
      "description": "Professional recording with advanced features",
      "basePrice": 200.00,
      "durationMin": 120,
      "sortOrder": 2
    },
    {
      "id": "pack-aa0e8400-e29b-41d4",
      "name": "Enterprise Package",
      "description": "Complete production package with full support",
      "basePrice": 500.00,
      "durationMin": 240,
      "sortOrder": 3
    }
  ]
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Unique pack identifier |
| `name` | string | Display name of the pack |
| `description` | string \| null | Detailed description |
| `basePrice` | number | Base price of the pack |
| `durationMin` | number | Suggested duration in minutes |
| `sortOrder` | number | Display order (lower numbers first) |

### Error Responses

**Unauthorized:**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

**Forbidden:**

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Admin access required"
  }
}
```

**Use Cases:**
- Populate pack dropdown in reservation creation form
- Display available package options when editing reservations
- Show pricing information for customer quotes
- Help admins select appropriate service level for customer needs
- Provide suggested durations for reservation planning

---

## 13. Get Available Supplements

⭐ **NEWLY ADDED** - This endpoint provides the list of available supplement services for use in reservation creation and editing forms.

Retrieve all active supplement services available for podcast reservations. Used to populate multi-select/checkbox fields in admin reservation forms.

### Endpoint
```
GET /api/v1/admin/reservations/podcast/supplements
```

### Authentication
✅ Required (Admin only)

### Query Parameters

None required.

### Request Example

```http
GET /api/v1/admin/reservations/podcast/supplements
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "supp-990e8400-e29b-41d4",
      "name": "Professional Editing",
      "description": "Full audio editing and post-production",
      "price": 80.00,
      "sortOrder": 1
    },
    {
      "id": "supp-aa0e8400-e29b-41d4",
      "name": "Video Recording",
      "description": "Multi-camera video recording setup",
      "price": 150.00,
      "sortOrder": 2
    },
    {
      "id": "supp-bb0e8400-e29b-41d4",
      "name": "Live Streaming",
      "description": "Live stream to multiple platforms",
      "price": 100.00,
      "sortOrder": 3
    },
    {
      "id": "supp-cc0e8400-e29b-41d4",
      "name": "Transcription Service",
      "description": "Professional transcription of episode",
      "price": 50.00,
      "sortOrder": 4
    }
  ]
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Unique supplement identifier |
| `name` | string | Display name of the supplement |
| `description` | string \| null | Detailed description |
| `price` | number | Additional price for this supplement |
| `sortOrder` | number | Display order (lower numbers first) |

### Error Responses

**Unauthorized:**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

**Forbidden:**

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Admin access required"
  }
}
```

**Use Cases:**
- Populate supplements multi-select in reservation creation form
- Display available add-on services when editing reservations
- Show pricing for accurate quote calculation
- Allow multiple supplement selection for comprehensive service packages
- Help admins configure complete service offerings for customers

---

## Shared Response Examples

### Example: Created Reservation Response

Used by: [Create Reservation](#1-create-reservation-admin)

```json
{
  "success": true,
  "data": {
    "reservation": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "confirmationId": "CONF-2025-0042",
      "status": "confirmed",
      "startAt": "2025-11-20T10:00:00.000+01:00",
      "endAt": "2025-11-20T12:00:00.000+01:00",
      "calendarStart": "2025-11-20T09:00:00.000Z",
      "calendarEnd": "2025-11-20T11:00:00.000Z",
      "durationHours": 2,
      "timezone": "Europe/Paris",
      "themeId": "theme-110e8400-e29b-41d4",
      "customTheme": null,
      "podcastDescription": "A tech podcast",
      "customerName": "Alice Dubois",
      "customerEmail": "alice.dubois@example.com",
      "customerPhone": "+33612345678",
      "totalPrice": 280.00,
      "assignedAdminId": "admin-abc123-e29b-41d4",
      "createdAt": "2025-11-16T08:30:22.123Z",
      "confirmedAt": "2025-11-16T08:30:22.123Z"
    }
  }
}
```

---

## Error Responses

### Common HTTP Status Codes

| Code | Description | When It Occurs |
|------|-------------|----------------|
| `200 OK` | Success | GET, PATCH requests succeeded |
| `201 Created` | Resource created | POST created new reservation |
| `400 Bad Request` | Validation error | Invalid input data |
| `401 Unauthorized` | Not authenticated | Missing or invalid token |
| `403 Forbidden` | Not admin | User doesn't have admin role |
| `404 Not Found` | Resource not found | Reservation ID doesn't exist |
| `409 Conflict` | Business rule violation | Slot already booked, invalid state transition |
| `500 Internal Server Error` | Server error | Unexpected server error |

### Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [
      {
        "field": "fieldName",
        "message": "Field-specific error"
      }
    ]
  }
}
```

### Common Error Codes

**VALIDATION_ERROR:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "endAt",
        "message": "Duration must be a positive multiple of 60 minutes (1h, 2h, 3h, ...)."
      }
    ]
  }
}
```

**SLOT_ALREADY_BOOKED:**
```json
{
  "success": false,
  "error": {
    "code": "SLOT_ALREADY_BOOKED",
    "message": "The selected time slot is no longer available"
  }
}
```

**RESERVATION_NOT_FOUND:**
```json
{
  "success": false,
  "error": {
    "code": "RESERVATION_NOT_FOUND",
    "message": "Reservation not found"
  }
}
```

**RESERVATION_NOT_EDITABLE:**
```json
{
  "success": false,
  "error": {
    "code": "RESERVATION_NOT_EDITABLE",
    "message": "Cannot modify completed or cancelled reservations"
  }
}
```

**UNAUTHORIZED:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

**FORBIDDEN:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Admin access required"
  }
}
```

---

## Workflow Examples

### Workflow 1: Admin Creates Phone Booking

```
1. Customer calls to book a 2-hour session on Nov 20 at 10:00

2. Admin creates confirmed reservation:
   POST /api/v1/admin/reservations/podcast
   {
     "startAt": "2025-11-20T10:00:00+01:00",
     "endAt": "2025-11-20T12:00:00+01:00",
     "status": "confirmed",
     "customerName": "Alice Dubois",
     "customerEmail": "alice.dubois@example.com",
     ...
   }

3. System generates confirmation ID: CONF-2025-0042

4. Admin emails customer with confirmation details
```

### Workflow 2: Review and Confirm Pending Reservation

```
1. Get pending reservations:
   GET /api/v1/admin/reservations/podcast/calendar/pending

2. Admin clicks on pending reservation

3. Get full details:
   GET /api/v1/admin/reservations/podcast/{id}

4. Admin reviews customer info and requested time

5. Admin confirms:
   PATCH /api/v1/admin/reservations/podcast/{id}/status
   { "status": "confirmed" }

6. System generates confirmation ID and blocks slot
```

### Workflow 3: Drag & Drop Rescheduling

```
1. Get confirmed calendar for Nov 20:
   GET /api/v1/admin/reservations/podcast/calendar/confirmed?date=2025-11-20

2. Admin drags 2-hour reservation from 10:00-12:00 to 14:00-16:00

3. Frontend calls:
   PATCH /api/v1/admin/reservations/podcast/{id}/schedule
   {
     "startAt": "2025-11-20T14:00:00+01:00",
     "endAt": "2025-11-20T16:00:00+01:00"
   }

4. System validates availability and updates

5. Calendar refreshes with new position
```

### Workflow 4: Handle Slot Conflict

```
1. Admin attempts to confirm pending reservation:
   PATCH /api/v1/admin/reservations/podcast/{id}/status
   { "status": "confirmed" }

2. Response: 409 SLOT_ALREADY_BOOKED

3. Admin options:
   a. Reschedule using PATCH /:id/schedule
   b. Contact customer for alternative time
   c. Reject: PATCH /:id/status { "status": "rejected" }
```

### Workflow 5: Resize Reservation

```
1. Admin resizes 2-hour reservation to 3 hours

2. Frontend calculates new endAt:
   Original: 10:00-12:00 (2h)
   New: 10:00-13:00 (3h)

3. Call:
   PATCH /api/v1/admin/reservations/podcast/{id}/schedule
   {
     "startAt": "2025-11-20T10:00:00+01:00",
     "endAt": "2025-11-20T13:00:00+01:00",
     "reason": "Extended session requested"
   }

4. System validates 12:00-13:00 is available

5. Update succeeds, calendar shows extended block
```

---

## Frontend Implementation Guide

### Calendar Integration

**Rendering Multi-Hour Events:**
```javascript
// Example: Render 3-hour event spanning 10:00-13:00
const reservation = {
  calendarStart: "2025-11-20T09:00:00.000Z", // 10:00 Paris time
  calendarEnd: "2025-11-20T12:00:00.000Z",   // 13:00 Paris time
  durationHours: 3
};

// Calculate visual height
const hourHeight = 64; // pixels per hour
const eventHeight = reservation.durationHours * hourHeight; // 192px
```

**Drag & Drop Validation:**
```javascript
// Before calling API, validate:
1. New times are on the hour (minutes === 0)
2. Duration is whole hours
3. Within working hours (09:00-18:00)

const isValid = 
  startAt.getMinutes() === 0 &&
  endAt.getMinutes() === 0 &&
  (endAt - startAt) % 3600000 === 0; // 3600000ms = 1 hour
```

**Optimistic Updates:**
```javascript
// Update UI immediately
updateCalendarEvent(reservationId, newTimes);

// Call API
try {
  await updateSchedule(reservationId, newTimes);
} catch (error) {
  // Revert on error
  revertCalendarEvent(reservationId, oldTimes);
  showError(error.message);
}
```

### State Management

**Separate Calendars:**
```javascript
// Maintain separate state for pending vs confirmed
const confirmedReservations = [];
const pendingReservations = [];

// Load both
await Promise.all([
  fetchConfirmedCalendar(),
  fetchPendingCalendar()
]);
```

**Cache Invalidation:**
```javascript
// After create/update/delete, refresh both calendars
await createReservation(data);
await Promise.all([
  refreshConfirmedCalendar(),
  refreshPendingCalendar()
]);
```

---

## Testing Scenarios

### Valid Cases
✅ Create 1-hour reservation  
✅ Create 3-hour reservation  
✅ Drag reservation to new time  
✅ Resize reservation from 2h to 4h  
✅ Confirm pending reservation  
✅ Cancel confirmed reservation  

### Invalid Cases (Should Fail)
❌ Create 1.5-hour reservation (90 minutes)  
❌ Start time at 10:30 (not on the hour)  
❌ Drag to overlapping slot  
❌ Resize cancelled reservation  
❌ Confirm reservation with invalid duration  

---

## Response Time Expectations

| Endpoint | Expected Response Time |
|----------|----------------------|
| Create Reservation | < 800ms |
| Get Details | < 300ms |
| Update Schedule | < 600ms (includes availability check) |
| Update Status | < 500ms |
| Get Calendar (single day) | < 400ms |
| Get Calendar (30 days) | < 800ms |

---

## Support & Additional Resources

**Related Documentation:**
- `docs/FIXED_DURATION_IMPLEMENTATION_PLAN.md` - Backend implementation details
- `docs/required-changes.md` - System requirements specification
- `PODCAST_IMPLEMENTATION_SUMMARY.md` - Original system overview

**Backend Team Contact:**  
[Your contact information]


---

## Implementation Status Summary


**Last Updated:** 2025-11-21 12:20

### ✅ All Endpoints Fully Implemented

All 13 admin endpoints are production-ready and fully functional:

| # | Endpoint | Method | Path |
|---|----------|--------|------|
| 1 | Create Reservation (Admin) | POST | `/podcast` |
| 2 | Get Reservation Details | GET | `/podcast/:id` |
| 3 | Update Schedule | PATCH | `/podcast/:id/schedule` |
| 4 | Update Status | PATCH | `/podcast/:id/status` |
| 5 | Get Confirmed Calendar | GET | `/podcast/calendar/confirmed` |
| 6 | Get Pending Calendar | GET | `/podcast/calendar/pending` |
| 7 | List Reservations | GET | `/podcast` |
| 8 | Delete Reservation | DELETE | `/podcast/:id` |
| 9 | Add Note | POST | `/podcast/:id/notes` |
| 10 | Get Client Data | GET | `/podcast/client/:clientId` |
| 11 | Get Available Decors | GET | `/podcast/decors` |
| 12 | Get Available Packs | GET | `/podcast/packs` |
| 13 | Get Available Supplements | GET | `/podcast/supplements` |

### 🎯 Implementation Complete

**Status:** 100% of documented endpoints are implemented and ready for use.

**Features:**
- ✅ Admin phone bookings with auto-generated confirmation IDs
- ✅ Calendar drag-and-drop scheduling
- ✅ Slot conflict detection
- ✅ Whole-hour duration enforcement
- ✅ On-the-hour time slot validation
- ✅ Timezone support
- ✅ Separate confirmed/pending calendar feeds
- ✅ Complete CRUD operations
- ✅ Status management with history tracking

### 📁 Reference Files

For implementation details, see:
- **`ENDPOINTS_COMPLETE_READY_FOR_TESTING.md`** - Testing guide and examples
- **`ADMIN_API_VERIFICATION_REPORT.md`** - Original verification analysis

---

## Support & Additional Resources

**Related Documentation:**
- `ENDPOINTS_IMPLEMENTATION_SUMMARY.md` - Implementation progress and next steps
- `ADMIN_API_VERIFICATION_REPORT.md` - Detailed API verification report
- `docs/FIXED_DURATION_IMPLEMENTATION_PLAN.md` - Backend implementation details
- `docs/required-changes.md` - System requirements specification
- `PODCAST_IMPLEMENTATION_SUMMARY.md` - Original system overview

**Backend Team Contact:**  
[Your contact information]

---

**End of Document**
