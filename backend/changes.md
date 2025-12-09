
# Podcast Reservation System – Updated Architecture (Décor / Packs / Availability / Dynamic Form)

This document specifies database changes, API contracts, server-side logic, admin workflow, and frontend implications to implement the new podcast reservation flow.


## Updated Database Schema

### 1. Overview of New / Updated Tables

- **New: `podcast_decor`**
  - Master data of décor options.

- **New: `podcast_pack_offers`**
  - Master data of base pack offers.

- **New: `podcast_supplement_services`**
  - Master data of optional supplements.

- **New: `podcast_form_questions`**
  - Admin-defined dynamic questions.

- **New: `podcast_form_question_options`**
  - Options for select-type questions.

- **New: `podcast_reservations`**
  - Core reservation entity, with status and requested slot.

- **New: `podcast_reservation_supplements`**
  - Junction table between reservations and supplement services.

- **New: `podcast_reservation_answers`**
  - Answers to dynamic questions per reservation.

> If you have existing reservation-related tables, adapt field changes accordingly instead of creating duplicates.

---

### 2. Table Definitions

#### 2.1 `podcast_decor`

Stores décor options selectable in Step 1.

| Column         | Type           | Constraints                         | Notes                          |
|----------------|----------------|-------------------------------------|--------------------------------|
| `id`           | UUID / INT PK  | PK                                  |                                |
| `name`         | VARCHAR(255)   | NOT NULL                            | Display name                   |
| `description`  | TEXT           | NULL                                | Optional descriptive text      |
| `image_url`    | VARCHAR(1024)  | NULL                                | For client display             |
| `is_active`    | BOOLEAN        | NOT NULL DEFAULT TRUE               | Soft-disable in UI             |
| `sort_order`   | INT            | NOT NULL DEFAULT 0                  | Ordering in lists              |
| `created_at`   | TIMESTAMP      | NOT NULL                            |                                |
| `updated_at`   | TIMESTAMP      | NOT NULL                            |                                |

---

#### 2.2 `podcast_pack_offers`

Pack offers selectable in Step 2.

| Column         | Type           | Constraints                         | Notes                          |
|----------------|----------------|-------------------------------------|--------------------------------|
| `id`           | UUID / INT PK  | PK                                  |                                |
| `name`         | VARCHAR(255)   | NOT NULL                            |                                |
| `description`  | TEXT           | NULL                                |                                |
| `base_price`   | DECIMAL(10,2)  | NOT NULL                            | Currency amount                |
| `duration_min` | INT            | NOT NULL                            | Duration used for slot calc    |
| `is_active`    | BOOLEAN        | NOT NULL DEFAULT TRUE               |                                |
| `sort_order`   | INT            | NOT NULL DEFAULT 0                  |                                |
| `created_at`   | TIMESTAMP      | NOT NULL                            |                                |
| `updated_at`   | TIMESTAMP      | NOT NULL                            |                                |

---

#### 2.3 `podcast_supplement_services`

Optional supplements selectable in Step 2.

| Column         | Type           | Constraints                         | Notes                          |
|----------------|----------------|-------------------------------------|--------------------------------|
| `id`           | UUID / INT PK  | PK                                  |                                |
| `name`         | VARCHAR(255)   | NOT NULL                            |                                |
| `description`  | TEXT           | NULL                                |                                |
| `price`        | DECIMAL(10,2)  | NOT NULL                            |                                |
| `is_active`    | BOOLEAN        | NOT NULL DEFAULT TRUE               |                                |
| `sort_order`   | INT            | NOT NULL DEFAULT 0                  |                                |
| `created_at`   | TIMESTAMP      | NOT NULL                            |                                |
| `updated_at`   | TIMESTAMP      | NOT NULL                            |                                |

---

#### 2.4 `podcast_form_questions`

Dynamic admin-configurable form questions (Step 4). Admin can add any number of questions; all active questions are returned to the client form and their answers are stored as per-reservation metadata.

| Column            | Type           | Constraints                         | Notes                                                         |
|-------------------|----------------|-------------------------------------|---------------------------------------------------------------|
| `id`              | UUID / INT PK  | PK                                  |                                                               |
| `label`           | VARCHAR(255)   | NOT NULL                            | Question text                                                 |
| `field_name`      | VARCHAR(255)   | NOT NULL UNIQUE                     | Stable key used in API payloads                               |
| `question_type`   | VARCHAR(50)    | NOT NULL                            | `text`, `textarea`, `select`, `multi_select`, `number`, etc. |
| `is_required`     | BOOLEAN        | NOT NULL DEFAULT FALSE              | Server-side validation                                        |
| `help_text`       | TEXT           | NULL                                | Optional description                                          |
| `order_index`     | INT            | NOT NULL DEFAULT 0                  | Order in form                                                 |
| `is_active`       | BOOLEAN        | NOT NULL DEFAULT TRUE               | Soft-delete                                                   |
| `created_at`      | TIMESTAMP      | NOT NULL                            |                                                               |
| `updated_at`      | TIMESTAMP      | NOT NULL                            |                                                               |

> For select-type questions, `question_type` will be `select` or `multi_select` and options come from `podcast_form_question_options`.

---

#### 2.5 `podcast_form_question_options`

Options for select-type questions.

| Column            | Type           | Constraints                         | Notes                         |
|-------------------|----------------|-------------------------------------|-------------------------------|
| `id`              | UUID / INT PK  | PK                                  |                               |
| `question_id`     | FK -> `podcast_form_questions.id` | NOT NULL          |                               |
| `value`           | VARCHAR(255)   | NOT NULL                            | Value sent in API             |
| `label`           | VARCHAR(255)   | NOT NULL                            | Display text in UI            |
| `order_index`     | INT            | NOT NULL DEFAULT 0                  |                               |
| `is_active`       | BOOLEAN        | NOT NULL DEFAULT TRUE               |                               |

---

#### 2.6 `podcast_reservations`

Core reservation entity supporting pending/confirmed lifecycle.

| Column                 | Type           | Constraints                                     | Notes                                                                 |
|------------------------|----------------|-------------------------------------------------|-----------------------------------------------------------------------|
| `id`                   | UUID / INT PK  | PK                                              |                                                                       |
| `status`               | VARCHAR(50)    | NOT NULL                                        | `pending`, `confirmed`, `cancelled`, `rejected`                       |
| `requested_date`       | DATE           | NOT NULL                                        | Client-requested date (Step 3)                                        |
| `requested_start_time` | TIME           | NOT NULL                                        | `HH:MM` local time                                                    |
| `requested_end_time`   | TIME           | NOT NULL                                        | Derived from pack duration or explicitly provided                     |
| `final_date`           | DATE           | NULL                                            | Confirmed date (may equal requested)                                  |
| `final_start_time`     | TIME           | NULL                                            | Confirmed slot start (blocks availability)                            |
| `final_end_time`       | TIME           | NULL                                            | Confirmed slot end                                                    |
| `decor_id`             | FK -> `podcast_decor.id`              | NULL        | Optional; if required, add NOT NULL                                   |
| `pack_offer_id`        | FK -> `podcast_pack_offers.id`        | NOT NULL    | Selected pack                                                         |
| `customer_name`        | VARCHAR(255)   | NOT NULL                                        |                                                                       |
| `customer_email`       | VARCHAR(255)   | NOT NULL                                        | For confirmations                                                     |
| `customer_phone`       | VARCHAR(50)    | NULL                                            | Optional to contact                                                   |
| `notes`                | TEXT           | NULL                                            | Free text from client                                                 |
| `metadata`             | JSON / TEXT    | NULL                                            | Free-form key/value metadata provided by the client                   |
| `total_price`          | DECIMAL(10,2)  | NOT NULL                                        | Derived server-side from pack + supplements                           |
| `created_at`           | TIMESTAMP      | NOT NULL                                        |                                                                       |
| `updated_at`           | TIMESTAMP      | NOT NULL                                        |                                                                       |
| `confirmed_at`         | TIMESTAMP      | NULL                                            | When admin confirms                                                   |
| `confirmed_by_admin_id`| FK -> `admins.id` or similar | NULL               | Audit trail                                                          |

**Key invariants:**

- Pending reservations:
  - `status = 'pending'`
  - `final_*` fields are `NULL`.
- Confirmed reservations:
  - `status = 'confirmed'`
  - `final_date`, `final_start_time`, `final_end_time` are NOT NULL and define the blocked slot.
- Availability calculation uses only confirmed reservations (`final_*`).

> To enforce uniqueness at DB level, consider a unique index on `(final_date, final_start_time, final_end_time)` for confirmed rows only (partial index / conditional unique constraint depending on DB).

---

#### 2.7 `podcast_reservation_supplements`

Many-to-many between reservations and supplements.

| Column               | Type           | Constraints                         | Notes                                  |
|----------------------|----------------|-------------------------------------|----------------------------------------|
| `id`                 | UUID / INT PK  | PK                                  |                                        |
| `reservation_id`     | FK -> `podcast_reservations.id`       | NOT NULL |                                        |
| `supplement_id`      | FK -> `podcast_supplement_services.id`| NOT NULL |                                        |
| `price_at_booking`   | DECIMAL(10,2)  | NOT NULL                            | Snapshot to avoid pricing drift issues |

Unique index: `(reservation_id, supplement_id)` to avoid duplicates.

---

#### 2.8 `podcast_reservation_answers`

Stores all dynamic answers for a reservation.

| Column               | Type           | Constraints                                   | Notes                                                     |
|----------------------|----------------|-----------------------------------------------|-----------------------------------------------------------|
| `id`                 | UUID / INT PK  | PK                                            |                                                           |
| `reservation_id`     | FK -> `podcast_reservations.id`       | NOT NULL       |                                                           |
| `question_id`        | FK -> `podcast_form_questions.id`     | NOT NULL       |                                                           |
| `answer_text`        | TEXT           | NULL                                          | For text/long text/number (stored as string)             |
| `answer_option_ids`  | JSON / TEXT    | NULL                                          | For select/multi-select; stores array of option IDs/values |
| `created_at`         | TIMESTAMP      | NOT NULL                                      |                                                           |

Unique index: `(reservation_id, question_id)`.

---

### 3. Relationships Summary

- **`podcast_reservations.decor_id` → `podcast_decor.id`**
- **`podcast_reservations.pack_offer_id` → `podcast_pack_offers.id`**
- **`podcast_reservation_supplements.reservation_id` → `podcast_reservations.id`**
- **`podcast_reservation_supplements.supplement_id` → `podcast_supplement_services.id`**
- **`podcast_reservation_answers.reservation_id` → `podcast_reservations.id`**
- **`podcast_reservation_answers.question_id` → `podcast_form_questions.id`**
- **`podcast_form_question_options.question_id` → `podcast_form_questions.id`**

---

### 4. Sample Records

#### 4.1 `podcast_decor`

```json
[
  {
    "id": 1,
    "name": "Classic Studio",
    "description": "Neutral background with warm lighting.",
    "image_url": "https://cdn.example.com/decor/classic.jpg",
    "is_active": true,
    "sort_order": 1
  },
  {
    "id": 2,
    "name": "Urban Loft",
    "description": "Brick wall backdrop with neon accents.",
    "image_url": "https://cdn.example.com/decor/loft.jpg",
    "is_active": true,
    "sort_order": 2
  }
]
```

#### 4.2 `podcast_pack_offers`

```json
[
  {
    "id": 1,
    "name": "Standard 60 min",
    "description": "60-minute studio session with basic editing.",
    "base_price": 200.00,
    "duration_min": 60,
    "is_active": true,
    "sort_order": 1
  },
  {
    "id": 2,
    "name": "Premium 90 min",
    "description": "90-minute session with advanced post-production.",
    "base_price": 350.00,
    "duration_min": 90,
    "is_active": true,
    "sort_order": 2
  }
]
```

#### 4.3 `podcast_supplement_services`

```json
[
  {
    "id": 1,
    "name": "Extra Cameras",
    "description": "Additional camera angles.",
    "price": 80.00,
    "is_active": true,
    "sort_order": 1
  },
  {
    "id": 2,
    "name": "Social Media Cutdown",
    "description": "Short clips for social media.",
    "price": 120.00,
    "is_active": true,
    "sort_order": 2
  }
]
```

#### 4.4 `podcast_form_questions` & `podcast_form_question_options`

```json
[
  {
    "id": 1,
    "label": "What is your podcast name?",
    "field_name": "podcast_name",
    "question_type": "text",
    "is_required": true,
    "order_index": 1,
    "is_active": true
  },
  {
    "id": 2,
    "label": "Preferred language",
    "field_name": "preferred_language",
    "question_type": "select",
    "is_required": true,
    "order_index": 2,
    "is_active": true
  }
]
```

```json
[
  { "id": 10, "question_id": 2, "value": "en", "label": "English", "order_index": 1, "is_active": true },
  { "id": 11, "question_id": 2, "value": "fr", "label": "French",  "order_index": 2, "is_active": true }
]
```

#### 4.5 `podcast_reservations` (pending vs confirmed)

```json
[
  {
    "id": 100,
    "status": "pending",
    "requested_date": "2025-11-20",
    "requested_start_time": "10:00",
    "requested_end_time": "11:00",
    "final_date": null,
    "final_start_time": null,
    "final_end_time": null,
    "decor_id": 2,
    "pack_offer_id": 1,
    "customer_name": "Alice Doe",
    "customer_email": "alice@example.com",
    "customer_phone": "+33123456789",
    "total_price": 280.00
  },
  {
    "id": 101,
    "status": "confirmed",
    "requested_date": "2025-11-20",
    "requested_start_time": "14:00",
    "requested_end_time": "15:00",
    "final_date": "2025-11-20",
    "final_start_time": "14:00",
    "final_end_time": "15:00",
    "decor_id": 1,
    "pack_offer_id": 1,
    "customer_name": "Bob Smith",
    "customer_email": "bob@example.com",
    "customer_phone": null,
    "total_price": 200.00
  }
]
```

---

## Updated API Specification

### 1. Client-Facing Endpoints

#### 1.1 `GET /api/public/podcast/form-config`

**Purpose**

- Single call to fetch all data needed for Steps 1–4:
  - Décor options
  - Pack offers
  - Supplement services
  - Dynamic questions and their options
  - Availability configuration (e.g., slot duration, opening hours) if needed

**Request**

- Method: `GET`
- Query params: none (optional `locale` if needed)
- Auth: public (rate limited)

**Response 200**

```json
{
  "decorOptions": [
    {
      "id": 1,
      "name": "Classic Studio",
      "description": "Neutral background with warm lighting.",
      "imageUrl": "https://cdn.example.com/decor/classic.jpg"
    }
  ],
  "packOffers": [
    {
      "id": 1,
      "name": "Standard 60 min",
      "description": "60-minute studio session with basic editing.",
      "basePrice": 200.0,
      "durationMin": 60
    }
  ],
  "supplementServices": [
    {
      "id": 1,
      "name": "Extra Cameras",
      "description": "Additional camera angles.",
      "price": 80.0
    }
  ],
  "questions": [
    {
      "id": 1,
      "fieldName": "podcast_name",
      "label": "What is your podcast name?",
      "questionType": "text",
      "isRequired": true,
      "helpText": null,
      "orderIndex": 1,
      "options": []
    },
    {
      "id": 2,
      "fieldName": "preferred_language",
      "label": "Preferred language",
      "questionType": "select",
      "isRequired": true,
      "orderIndex": 2,
      "options": [
        { "id": 10, "value": "en", "label": "English" },
        { "id": 11, "value": "fr", "label": "French" }
      ]
    }
  ]
}
```

**Validation / Error Cases**

- If configuration is incomplete (no active packs, etc.), return 500 with a clear admin-facing message:
  - `500 CONFIGURATION_INCOMPLETE`

**Frontend Flow Implications**

- **Step 1–2–4 data** comes from this endpoint; call once when the form loads.
- Store `decorOptions`, `packOffers`, `supplementServices`, `questions` in client state.
- Do **not** make separate calls for each step; reuse this data when the user navigates through the steps.

---

#### 1.2 `GET /api/public/podcast/availability`

**Purpose**

- Return **only available time slots** for a given date.
- Only **confirmed** reservations should block slots.
- No client-side slot holding; double booking (pending state) is allowed.

**Request**

- Method: `GET`
- Query parameters:
  - `date` (required) – string, `YYYY-MM-DD`
- Auth: public (rate limited)

Example:  
`GET /api/public/podcast/availability?date=2025-11-20`

**Response 200**

```json
{
  "date": "2025-11-20",
  "availableSlots": ["09:00", "09:30", "10:00", "10:30", "11:00"]
}
```

**Validation Rules**

- `date`:
  - Required.
  - Must be valid ISO date.
  - Must not be in the past (configurable tolerance).
- If date is outside working days/hours, return an empty array:
  - `{"date": "2025-11-17", "availableSlots": []}`

**Error Cases**

- `400 INVALID_DATE` – invalid format or past date if disallowed.
- `500 AVAILABILITY_CALCULATION_FAILED` – unexpected internal error.

**Frontend Flow Implications**

- **Step 3**:
  - When the user selects a date, call `/availability`.
  - Render the `availableSlots` as selectable times.
  - Do **not** assume a selection holds the slot.
  - On re-opening Step 3, re-fetch availability to reflect new confirmations by admin.

---

#### 1.3 `POST /api/public/podcast/reservations`

**Purpose**

- Single unified endpoint for **full form submission** (all 4 steps).
- Creates a reservation in `pending` status; no slot blocking yet.

**Request**

- Method: `POST`
- Auth: public (rate limited)
- Body:

```json
{
  "decorId": 1,
  "packOfferId": 1,
  "supplementIds": [1, 2],
  "requestedDate": "2025-11-20",
  "requestedStartTime": "10:00",
  "customer": {
    "name": "Alice Doe",
    "email": "alice@example.com",
    "phone": "+33123456789"
  },
  "notes": "We will bring our own intro music.",
  "metadata": {
    "campaign": "black-friday-2025",
    "source": "landing-page"
  },
  "answers": [
    {
      "questionId": 1,
      "fieldName": "podcast_name",
      "value": "The Growth Lab"
    },
    {
      "questionId": 2,
      "fieldName": "preferred_language",
      "value": "en"
    }
  ]
}
```

**Server-Side Behavior**

- Compute `requested_end_time` from `packOffer.duration_min` and `requestedStartTime`.
- Load supplements and compute `total_price = pack.base_price + sum(supplement.price)` (or business rule).
- Create `podcast_reservations` row with:
  - `status = 'pending'`
  - `requested_date`, `requested_start_time`, `requested_end_time`
  - `decor_id`, `pack_offer_id`
  - customer fields, `notes`, `total_price`
- Insert `podcast_reservation_supplements`.
- Validate answers against `podcast_form_questions` (ensure required questions present; valid types/options) and insert into `podcast_reservation_answers`.

**Response 201**

```json
{
  "reservationId": 100,
  "status": "pending",
  "requestedDate": "2025-11-20",
  "requestedStartTime": "10:00",
  "requestedEndTime": "11:00",
  "totalPrice": 280.0,
  "message": "Your reservation request has been received and is pending confirmation."
}
```

**Validation Rules**

- **Decor / Pack / Supplements**
  - `packOfferId` must refer to an active pack.
  - `decorId` (if provided) must refer to an active décor.
  - All `supplementIds` must refer to active supplements.
- **Date / Time**
  - `requestedDate` and `requestedStartTime` must:
    - Be valid date/time formats.
    - Be within opening hours.
    - Not be in the past.
  - No uniqueness check here: pending reservations are allowed to overlap.
- **Dynamic Questions**
  - Load active questions.
  - For each required question:
    - Ensure an answer exists in `answers` array.
  - For `select` / `multi_select`:
    - Ensure `value` matches one or more allowed option values for that question.
- **Metadata**
  - If provided, must be a JSON object (not an array) with string keys.
  - Optionally enforce a maximum size/depth to avoid storing excessively large payloads.
- **Customer Info**
  - `name` and `email` required; validate email format.

**Error Cases**

- `400 VALIDATION_ERROR` with field-level details.
- `404 PACK_OFFER_NOT_FOUND`, `404 DECOR_NOT_FOUND`, `404 SUPPLEMENT_NOT_FOUND`.
- `409 CONFIG_CONFLICT` if internal business rules conflict (e.g., pack disabled between form load and submission).
- `500 RESERVATION_CREATION_FAILED` on unexpected errors.

**Frontend Flow Implications**

- **Step 4 submission:**
  - On final “Submit Reservation” button, send **one POST** to `/reservations` with the entire payload.
  - Do not post partial data earlier (no multi-step server persistence).
- The frontend should **optimistically** show a “pending confirmation” screen and make it clear that timeslot is not yet guaranteed.

---

### 2. Admin Endpoints

#### 2.1 `GET /api/admin/podcast/reservations`

**Purpose**

- List reservations with filters for pending/confirmed, date ranges, etc.

**Request**

- Method: `GET`
- Auth: admin-only
- Query params (optional):
  - `status` – e.g. `pending`, `confirmed`.
  - `dateFrom`, `dateTo` – filter by requested or final dates.
  - `search` – search on name/email.

**Response 200** – paginated list including status, requested and final times.

---

#### 2.2 `GET /api/admin/podcast/reservations/:id`

**Purpose**

- View full reservation details including dynamic answers.

**Response 200 (example)**

```json
{
  "id": 100,
  "status": "pending",
  "requestedDate": "2025-11-20",
  "requestedStartTime": "10:00",
  "requestedEndTime": "11:00",
  "finalDate": null,
  "finalStartTime": null,
  "finalEndTime": null,
  "decor": { "id": 2, "name": "Urban Loft" },
  "packOffer": { "id": 1, "name": "Standard 60 min", "durationMin": 60 },
  "supplements": [
    { "id": 1, "name": "Extra Cameras", "priceAtBooking": 80.0 }
  ],
  "customer": {
    "name": "Alice Doe",
    "email": "alice@example.com",
    "phone": "+33123456789"
  },
  "answers": [
    {
      "questionId": 1,
      "fieldName": "podcast_name",
      "label": "What is your podcast name?",
      "value": "The Growth Lab"
    },
    {
      "questionId": 2,
      "fieldName": "preferred_language",
      "label": "Preferred language",
      "value": "en"
    }
  ],
  "totalPrice": 280.0
}
```

---

#### 2.3 `POST /api/admin/podcast/reservations/:id/confirm`

**Purpose**

- Admin confirms a reservation **and blocks the time slot**.
- Only at this point does the date/time become unavailable to others.

**Request**

- Method: `POST`
- Auth: admin-only
- Body:

```json
{
  "finalDate": "2025-11-20",
  "finalStartTime": "10:00"
}
```

If omitted, the server can default `finalDate` and `finalStartTime` to requested values, but explicit values provide flexibility (admin may negotiate a different time with client).

**Server Behavior (Transactional)**

1. Begin DB transaction.
2. Load reservation `r` by `id` with `FOR UPDATE` or equivalent lock.
3. Validate:
   - `r.status` is `pending` (not already confirmed/cancelled).
   - `finalDate` and `finalStartTime` valid and not in the past.
4. Calculate `finalEndTime`:
   - `finalEndTime = finalStartTime + packOffer.duration_min`.
5. Ensure time slot is still free:
   - Query all `confirmed` reservations on `finalDate` and check no overlap between `[finalStartTime, finalEndTime)` and each reservation’s `[final_start_time, final_end_time)`.
6. If overlap:
   - Rollback transaction.
   - Return `409 SLOT_ALREADY_BOOKED`.
7. Else:
   - Update reservation:
     - `status = 'confirmed'`
     - `final_date`, `final_start_time`, `final_end_time`
     - `confirmed_at = now()`
     - `confirmed_by_admin_id = current admin`
8. Commit transaction.
9. Optionally trigger confirmation email.

**Response 200**

```json
{
  "id": 100,
  "status": "confirmed",
  "finalDate": "2025-11-20",
  "finalStartTime": "10:00",
  "finalEndTime": "11:00",
  "message": "Reservation has been confirmed and the slot is now blocked."
}
```

**Error Cases**

- `404 RESERVATION_NOT_FOUND`
- `400 INVALID_FINAL_DATE_OR_TIME`
- `409 RESERVATION_NOT_PENDING` – already confirmed/cancelled.
- `409 SLOT_ALREADY_BOOKED` – slot is no longer available.
- `500 RESERVATION_CONFIRMATION_FAILED`

**System-Level Guarantees**

- **No slot holding on client side**:
  - Pending reservations do not create blocked slots; only confirmed ones do.
- **Double booking allowed until admin confirmation**:
  - Multiple pending reservations with overlapping requested slots are allowed.
- **Only confirmed reservations block availability**:
  - Implementation uses only `status = 'confirmed'` rows and `final_*` times for availability calculations.

**Frontend (Admin) Implications**

- Admin UI:
  - Displays `pending` reservations; admin calls or emails client to finalize details.
  - After agreement, admin selects a final date/time in an availability-aware UI (can call `/availability` to help).
  - Clicking “Confirm Reservation” calls this endpoint.
  - If `409 SLOT_ALREADY_BOOKED` occurs, UI shows message and forces admin to pick another time.

---

#### 2.4 `POST /api/admin/podcast/reservations/:id/cancel` (Optional but Recommended)

**Purpose**

- Allow admin to cancel a pending or confirmed reservation (business rules may differ).

**Behavior**

- Set `status = 'cancelled'`.
- If previously confirmed, freeing up the time slot for future availability calculations.

---

### 3. Validation Rules Summary

- **Cross-cutting**
  - All IDs must refer to active, non-deleted records.
  - Email validated for basic RFC format.
  - Input dates/times normalized to a canonical timezone.

- **Reservation status transitions**
  - `pending` → `confirmed` (only via admin confirm).
  - `pending` → `cancelled` or `rejected` (admin decision).
  - Confirmed reservations cannot be changed back to pending.

---

### 4. Frontend Form Flow (4 Steps) – Summary

- **Step 1 – Choose Décor**
  - Use `decorOptions` from `GET /form-config`.
- **Step 2 – Choose Pack Offer + Supplements**
  - Use `packOffers` and `supplementServices` from `GET /form-config`.
- **Step 3 – Select Date & Time**
  - For selected date, call `GET /availability?date=YYYY-MM-DD`.
  - Show only `availableSlots`.
  - Do **not** hold the slot; just remember selection in local state.
- **Step 4 – Dynamic Questions**
  - Render `questions` from `GET /form-config`.
  - On submit, send entire payload to `POST /reservations`.

---

## Podcast Availability Logic

### 1. Constraints & Inputs

- **Input**
  - `date: YYYY-MM-DD`.
- **Config**
  - Slot duration (e.g., 30 min) from `availabilityConfig.slotDurationMin`.
  - Opening hours per weekday from `availabilityConfig.openingHours`.
- **Data**
  - Confirmed reservations (`status = 'confirmed'`) with `final_date = date`.

**Key Rules**

- Pending reservations must **not** block availability.
- Only confirmed reservations determine unavailable intervals.

---

### 2. Algorithm for Generating Available Time Slots

1. **Normalize Inputs**
   - Parse `date` and determine weekday.
   - Fetch opening hours for this weekday.
   - If closed (no opening hours), return `availableSlots: []`.

2. **Generate Base Slots**
   - Let `slotDuration` = `slotDurationMin` (e.g. 30).
   - Let `dayStart` = opening hour start (e.g. 09:00).
   - Let `dayEnd` = opening hour end (e.g. 18:00).
   - Generate slot start times from `dayStart` to `dayEnd - minSessionDuration`.
     - `minSessionDuration` can be equal to `slotDuration` or max pack duration depending on business rule.
   - Example (30-min slots): `09:00`, `09:30`, `10:00`, …, `17:30`.

3. **Fetch Confirmed Reservations for the Date**
   - Query `podcast_reservations`:
     - `status = 'confirmed'`
     - `final_date = date`
   - Build an array of blocked intervals:
     - `blocked = [ [final_start_time, final_end_time), ... ]`

4. **Filter Slots**
   - For each candidate slot start time `t`:
     - Define slot interval `[t, t + slotDuration)`.
     - If this interval overlaps with **any** `blocked` interval, mark as unavailable.
     - Else, mark as available.
   - Overlap check:
     - Two intervals `[aStart, aEnd)` and `[bStart, bEnd)` overlap if:
       - `aStart < bEnd` AND `bStart < aEnd`.

5. **Convert to Response Format**
   - Format each available start time as `HH:MM` (24h).
   - Sort ascending.
   - Return:

```json
{
  "date": "YYYY-MM-DD",
  "availableSlots": ["HH:MM", ...]
}
```

---

### 3. Concurrency & Data Integrity

- **Race Conditions**
  - Two admins may attempt to confirm overlapping reservations concurrently.
- **Mitigation**
  - Use DB transactions with row or table-level locking when confirming.
  - Use a unique or exclusion constraint on confirmed intervals if supported:
    - Example (PostgreSQL): exclusion constraint on `tstzrange(final_start, final_end)` for `status = 'confirmed'`.
  - Confirm endpoint must:
    - Check slot availability **inside the transaction**.
    - Rollback and return `409 SLOT_ALREADY_BOOKED` on conflict.

---

### 4. Summary of System-Level Requirements Mapping

- **No slot holding on client side**
  - Achieved by:
    - `POST /reservations` creating only `pending` reservations.
    - Availability using only `status = 'confirmed'` rows.
- **Double booking allowed until admin confirmation**
  - Pending reservations can overlap; no check in client POST.
- **Only confirmed reservations block availability**
  - `GET /availability` uses `final_date`, `final_start_time`, `final_end_time` for rows where `status = 'confirmed'`.

---
