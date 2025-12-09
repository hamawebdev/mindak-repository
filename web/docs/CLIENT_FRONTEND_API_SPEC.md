# Podcast Reservation System - Client Frontend API Specification

**Document Version:** 1.0  
**Last Updated:** 2025-11-21  
**API Version:** v1

---

## Overview

This document provides complete API specifications for the **client-facing podcast reservation system**. These endpoints are publicly accessible (no authentication required) and allow clients to:

- View available podcast recording options (décor, packs, supplements)
- Check time slot availability
- Submit podcast reservation requests
- View reservation confirmation details

All client reservations are created with `pending` status and require admin confirmation before being finalized.

---

## Base URLs

- **v1 Client API:** `/api/v1/client`
- **Authentication:** Not required (public endpoints)
- **Content-Type:** `application/json`

---

## Table of Contents

### Client Endpoints (v1)
1. [Get Form Configuration](#1-get-form-configuration)
2. [Get Availability](#2-get-availability)
3. [Create Reservation](#3-create-reservation)
4. [Get Reservation Confirmation](#4-get-reservation-confirmation)

### Reference
5. [Data Models](#5-data-models)
6. [Error Responses](#6-error-responses)
7. [Workflow Examples](#7-workflow-examples)

---

## 1. Get Form Configuration

Retrieve all configuration data needed to render the podcast reservation form, including décor options, pack offers, supplement services, form questions, and availability settings.

### Endpoint
```
GET /api/v1/client/podcast/form-config
```

### Authentication
❌ Not required (public endpoint)

### Request Example

```http
GET /api/v1/client/podcast/form-config
Content-Type: application/json
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "data": {
    "decorOptions": [
      {
        "id": "decor-770e8400-e29b-41d4",
        "name": "Urban Loft",
        "description": "Modern industrial setting with exposed brick and natural lighting",
        "imageUrl": "https://cdn.example.com/decor/urban-loft.jpg"
      },
      {
        "id": "decor-880e8400-e29b-41d4",
        "name": "Minimalist Studio",
        "description": "Clean, professional white backdrop with acoustic treatment",
        "imageUrl": "https://cdn.example.com/decor/minimalist-studio.jpg"
      }
    ],
    "packOffers": [
      {
        "id": "pack-990e8400-e29b-41d4",
        "name": "Basic Recording",
        "description": "1-hour recording session with basic equipment",
        "metadata": [
          {
            "key": "description",
            "label": "Description",
            "value": "1-hour recording session with basic equipment",
            "type": "textarea"
          }
        ],
        "basePrice": 100.00,
        "durationMin": 60
      },
      {
        "id": "pack-aa0e8400-e29b-41d4",
        "name": "Premium Recording",
        "description": "2-hour recording session with professional equipment",
        "metadata": [
           {
            "key": "description",
            "label": "Description",
            "value": "2-hour recording session with professional equipment",
            "type": "textarea"
          }
        ],
        "basePrice": 200.00,
        "durationMin": 120
      },
      {
        "id": "pack-bb0e8400-e29b-41d4",
        "name": "Extended Session",
        "description": "3-hour recording session with full production support",
        "metadata": [
           {
            "key": "description",
            "label": "Description",
            "value": "3-hour recording session with full production support",
            "type": "textarea"
          }
        ],
        "basePrice": 280.00,
        "durationMin": 180
      }
    ],
    "supplementServices": [
      {
        "id": "supp-cc0e8400-e29b-41d4",
        "name": "Professional Editing",
        "description": "Full audio editing and mastering service",
        "price": 80.00
      },
      {
        "id": "supp-dd0e8400-e29b-41d4",
        "name": "Video Recording",
        "description": "Multi-camera video recording of your session",
        "price": 150.00
      },
      {
        "id": "supp-ee0e8400-e29b-41d4",
        "name": "Transcription Service",
        "description": "Professional transcription of your episode",
        "price": 50.00
      }
    ],
    "themes": [
      {
        "id": "theme-110e8400-e29b-41d4",
        "name": "Technology",
        "description": "Tech focused theme"
      },
      {
        "id": "theme-220e8400-e29b-41d4",
        "name": "Business",
        "description": "Business focused theme"
      }
    ],
    "questions": [
      {
        "id": "quest-ff0e8400-e29b-41d4",
        "label": "What is your podcast name?",
        "fieldName": "podcast_name",
        "questionType": "text",
        "isRequired": true,
        "helpText": "The name of your podcast show",
        "options": []
      },
      {
        "id": "quest-110e8400-e29b-41d4",
        "label": "Episode type",
        "fieldName": "episode_type",
        "questionType": "multi_select",
        "isRequired": true,
        "helpText": "Select all that apply",
        "options": [
          {
            "id": "opt-220e8400-e29b-41d4",
            "value": "interview",
            "label": "Interview"
          },
          {
            "id": "opt-330e8400-e29b-41d4",
            "value": "solo",
            "label": "Solo Episode"
          },
          {
            "id": "opt-440e8400-e29b-41d4",
            "value": "panel",
            "label": "Panel Discussion"
          }
        ]
      },
      {
        "id": "quest-550e8400-e29b-41d4",
        "label": "Number of guests",
        "fieldName": "guest_count",
        "questionType": "number",
        "isRequired": false,
        "helpText": "How many guests will be joining?",
        "options": []
      }
    ],
    "availabilityConfig": {
      "timezone": "Europe/Paris",
      "businessHours": {
        "monday": { "start": "09:00", "end": "18:00" },
        "tuesday": { "start": "09:00", "end": "18:00" },
        "wednesday": { "start": "09:00", "end": "18:00" },
        "thursday": { "start": "09:00", "end": "18:00" },
        "friday": { "start": "09:00", "end": "18:00" },
        "saturday": { "start": "10:00", "end": "16:00" },
        "sunday": null
      },
      "slotDurationMin": 60,
      "advanceBookingDays": 90,
      "minimumNoticeDays": 2
    }
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `decorOptions` | array | Available studio décor options |
| `packOffers` | array | Available recording packages with duration and pricing |
| `supplementServices` | array | Optional add-on services |
| `themes` | array | Available podcast themes (can select one or provide custom) |
| `questions` | array | Form questions to collect client information |
| `availabilityConfig` | object | Business hours and booking constraints |

### Question Types

- `text` - Single-line text input
- `textarea` - Multi-line text input
- `number` - Numeric input
- `email` - Email address input
- `phone` - Phone number input
- `select` - Single selection dropdown
- `multi_select` - Multiple selection checkboxes
- `radio` - Single selection radio buttons
- `date` - Date picker
- `time` - Time picker

---

## 2. Get Availability

Check available time slots for a specific date and pack offer. Returns both available and unavailable slots for calendar display.

### Endpoint
```
GET /api/v1/client/podcast/availability
```

### Authentication
❌ Not required (public endpoint)

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string (YYYY-MM-DD) | ✅ Yes | Date to check availability |
| `packOfferId` | string (UUID) | ✅ Yes | Pack offer ID to determine duration |

### Request Example

```http
GET /api/v1/client/podcast/availability?date=2025-11-25&packOfferId=pack-aa0e8400-e29b-41d4
Content-Type: application/json
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "data": {
    "date": "2025-11-25",
    "availableSlots": [
      {
        "startTime": "09:00",
        "endTime": "11:00"
      },
      {
        "startTime": "11:00",
        "endTime": "13:00"
      },
      {
        "startTime": "15:00",
        "endTime": "17:00"
      }
    ],
    "unavailableSlots": [
      {
        "startTime": "13:00",
        "endTime": "15:00"
      }
    ]
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `date` | string | The requested date (YYYY-MM-DD) |
| `availableSlots` | array | Time slots that can be booked |
| `unavailableSlots` | array | Time slots already booked or unavailable |
| `startTime` | string (HH:mm) | Slot start time in 24-hour format |
| `endTime` | string (HH:mm) | Slot end time in 24-hour format |

### Notes

- Slots are calculated based on the pack offer's `durationMin` value
- All times are in the studio's local timezone (see `availabilityConfig.timezone`)
- Slots respect business hours and existing reservations
- Only slots starting on the hour (00 minutes) are returned

### Error Responses

**Invalid Pack Offer:**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_PACK_OFFER",
    "message": "Pack offer not found"
  }
}
```

**Invalid Date Format:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid date format. Expected YYYY-MM-DD"
  }
}
```

---

## 3. Create Reservation

Submit a new podcast reservation request. The reservation will be created with `pending` status and requires admin confirmation.

### Endpoint
```
POST /api/v1/client/podcast/reservations
```

### Authentication
❌ Not required (public endpoint)

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `decorId` | string (UUID) | No | Selected décor option |
| `packOfferId` | string (UUID) | ✅ Yes | Selected recording package |
| `supplementIds` | array[UUID] | No | Selected supplement services |
| `themeId` | string (UUID) | Conditional | Selected theme ID (Either this or customTheme required) |
| `customTheme` | string | Conditional | Custom theme name (Either this or themeId required) |
| `podcastDescription` | string | ✅ Yes | Description of the podcast |
| `requestedDate` | string (YYYY-MM-DD) | ✅ Yes | Requested recording date |
| `requestedStartTime` | string (HH:mm) | ✅ Yes | Requested start time (24-hour format) |
| `customerName` | string | ✅ Yes | Customer full name (1-255 chars) |
| `customerEmail` | string | ✅ Yes | Customer email address |
| `customerPhone` | string | No | Customer phone number (max 50 chars) |
| `notes` | string | No | Additional notes or requests |
| `metadata` | object | No | Additional metadata (key-value pairs) |
| `answers` | array | ✅ Yes | Answers to form questions |

**Answer Object Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `questionId` | string (UUID) | ✅ Yes | Question ID from form config |
| `answerText` | string | Conditional | Text answer (for text/textarea questions) |
| `answerOptionIds` | array[string] | Conditional | Selected option IDs (for select/multi_select) |

### Request Example

```http
POST /api/v1/client/podcast/reservations
Content-Type: application/json

{
  "decorId": "decor-770e8400-e29b-41d4",
  "packOfferId": "pack-aa0e8400-e29b-41d4",
  "supplementIds": [
    "supp-cc0e8400-e29b-41d4",
    "supp-ee0e8400-e29b-41d4"
  ],
  "themeId": "theme-110e8400-e29b-41d4",
  "podcastDescription": "A podcast about tech startups and growth strategies.",
  "requestedDate": "2025-11-25",
  "requestedStartTime": "09:00",
  "customerName": "Alice Dubois",
  "customerEmail": "alice.dubois@example.com",
  "customerPhone": "+33612345678",
  "notes": "First time recording, would appreciate some guidance",
  "answers": [
    {
      "questionId": "quest-ff0e8400-e29b-41d4",
      "answerText": "The Growth Lab Podcast"
    },
    {
      "questionId": "quest-110e8400-e29b-41d4",
      "answerOptionIds": ["opt-220e8400-e29b-41d4", "opt-330e8400-e29b-41d4"]
    },
    {
      "questionId": "quest-550e8400-e29b-41d4",
      "answerText": "2"
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
    "id": "res-660e8400-e29b-41d4-a716-446655440000",
    "status": "pending",
    "message": "Reservation submitted successfully. Awaiting confirmation."
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Unique reservation ID |
| `status` | string | Always `pending` for new client reservations |
| `message` | string | Confirmation message for the user |

### Notes

- Reservations are created with `pending` status
- Admin must confirm the reservation before it becomes final
- A confirmation ID will be generated upon admin approval
- Client will receive email notification when reservation is confirmed
- The system validates slot availability before creating the reservation

### Error Responses

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "themeId",
        "message": "Either themeId or customTheme must be provided"
      },
      {
        "field": "podcastDescription",
        "message": "Podcast description is required"
      }
    ]
  }
}
```

**Validation Error (Missing Required Fields):**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "customerEmail",
        "message": "Invalid email format"
      },
      {
        "field": "answers",
        "message": "Required question 'quest-ff0e8400-e29b-41d4' not answered"
      }
    ]
  }
}
```

**Slot Already Booked:**

```json
{
  "success": false,
  "error": {
    "code": "SLOT_ALREADY_BOOKED",
    "message": "The selected time slot is no longer available. Please choose another time."
  }
}
```

**Invalid Pack Offer:**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_PACK_OFFER",
    "message": "Selected pack offer not found or is no longer available"
  }
}
```

**Invalid Supplement:**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_SUPPLEMENT",
    "message": "One or more selected supplements are not available"
  }
}
```

**Invalid Time Slot:**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_TIME_SLOT",
    "message": "Requested time is outside business hours or too far in advance"
  }
}
```

---

## 4. Get Reservation Confirmation

Retrieve confirmation details for a submitted reservation using the confirmation ID. This endpoint is used to display the confirmation page after submission or when clients return via email link.

### Endpoint
```
GET /api/v1/client/reservations/:confirmationId/confirmation
```

### Authentication
❌ Not required (public endpoint)

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `confirmationId` | string | ✅ Yes | Reservation confirmation ID |

### Request Example

```http
GET /api/v1/client/reservations/CONF-2025-0042/confirmation
Content-Type: application/json
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "data": {
    "confirmationId": "CONF-2025-0042",
    "type": "podcast",
    "status": "confirmed",
    "submittedAt": "2025-11-21T10:30:00.000Z",
    "clientAnswers": [
      {
        "questionText": "What is your podcast name?",
        "questionType": "text",
        "value": "The Growth Lab Podcast",
        "answerText": "The Growth Lab Podcast"
      },
      {
        "questionText": "Episode type",
        "questionType": "multi_select",
        "value": "interview, solo",
        "answerText": null
      },
      {
        "questionText": "Number of guests",
        "questionType": "number",
        "value": "2",
        "answerText": "2"
      }
    ]
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `confirmationId` | string | Unique confirmation identifier |
| `type` | string | Reservation type: `podcast` or `service` |
| `status` | string | Current status: `pending`, `confirmed`, `cancelled`, `completed` |
| `submittedAt` | string (ISO 8601) | When the reservation was submitted |
| `clientAnswers` | array | All answers provided by the client |

**Client Answer Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `questionText` | string | The question that was asked |
| `questionType` | string | Type of question (text, select, etc.) |
| `value` | string | Formatted answer value for display |
| `answerText` | string \| null | Raw text answer (if applicable) |

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

**Invalid Confirmation ID:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Confirmation ID is required"
  }
}
```

---

## 5. Data Models

### Décor Option

```typescript
{
  id: string;              // UUID
  name: string;            // Display name
  description: string;     // Detailed description
  imageUrl: string;        // URL to décor image
}
```

### Pack Offer

```typescript
{
  id: string;              // UUID
  name: string;            // Package name
  description: string;     // Package description (Deprecated: use metadata)
  metadata: MetadataItem[];// Flexible metadata configuration
  basePrice: number;       // Base price in euros
  durationMin: number;     // Duration in minutes (60, 120, 180, etc.)
}
```

### Metadata Item

```typescript
{
  key: string;
  label: string;
  value: string | number | boolean | string[];
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'list';
}
```

### Supplement Service

```typescript
{
  id: string;              // UUID
  name: string;            // Service name
  description: string;     // Service description
  price: number;           // Price in euros
}
```

### Theme

```typescript
{
  id: string;              // UUID
  name: string;            // Theme name
  description: string;     // Theme description
}
```

### Form Question

```typescript
{
  id: string;              // UUID
  label: string;           // Question label
  fieldName: string;       // Internal field name
  questionType: string;    // Question type (see Question Types)
  isRequired: boolean;     // Whether answer is required
  helpText: string | null; // Optional help text
  options: Option[];       // Options for select/multi_select questions
}
```

### Question Option

```typescript
{
  id: string;              // UUID
  value: string;           // Option value
  label: string;           // Display label
}
```

### Availability Config

```typescript
{
  timezone: string;                    // IANA timezone (e.g., "Europe/Paris")
  businessHours: {
    [day: string]: {                   // monday, tuesday, etc.
      start: string;                   // HH:mm format
      end: string;                     // HH:mm format
    } | null;                          // null if closed
  };
  slotDurationMin: number;             // Minimum slot duration (60)
  advanceBookingDays: number;          // How far ahead clients can book
  minimumNoticeDays: number;           // Minimum days notice required
}
```

### Time Slot

```typescript
{
  startTime: string;       // HH:mm format (24-hour)
  endTime: string;         // HH:mm format (24-hour)
}
```

### Reservation Answer

```typescript
{
  questionId: string;              // UUID of the question
  answerText?: string;             // For text-based questions
  answerOptionIds?: string[];      // For select/multi_select questions
}
```

### Reservation Status

```typescript
type ReservationStatus = 
  | 'pending'      // Awaiting admin confirmation
  | 'confirmed'    // Confirmed by admin
  | 'cancelled'    // Cancelled
  | 'completed';   // Recording session completed
```

---

## 6. Error Responses

All error responses follow a consistent format:

### Standard Error Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": []  // Optional array of detailed error information
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `SLOT_ALREADY_BOOKED` | 409 | Time slot is no longer available |
| `INVALID_PACK_OFFER` | 400 | Pack offer not found or inactive |
| `INVALID_SUPPLEMENT` | 400 | Supplement service not found or inactive |
| `INVALID_DECOR` | 400 | Décor option not found or inactive |
| `INVALID_TIME_SLOT` | 400 | Time slot outside business hours |
| `RESERVATION_NOT_FOUND` | 404 | Reservation not found |
| `INTERNAL_ERROR` | 500 | Internal server error |

### Validation Error Details

When validation fails, the `details` array provides field-specific errors:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "customerEmail",
        "message": "Invalid email format"
      },
      {
        "field": "requestedDate",
        "message": "Date must be in YYYY-MM-DD format"
      },
      {
        "field": "answers[0].answerText",
        "message": "Answer is required for this question"
      }
    ]
  }
}
```

---

## 7. Workflow Examples

### Complete Booking Flow

This example demonstrates the complete client booking workflow from form load to confirmation.

#### Step 1: Load Form Configuration

```http
GET /api/v1/client/podcast/form-config
```

**Response:** Returns all décor options, packs, supplements, questions, and availability config.

#### Step 2: Check Availability

User selects a pack and date, frontend checks availability:

```http
GET /api/v1/client/podcast/availability?date=2025-11-25&packOfferId=pack-aa0e8400-e29b-41d4
```

**Response:** Returns available time slots for the selected date and pack duration.

#### Step 3: Submit Reservation

User fills out the form and submits:

```http
POST /api/v1/client/podcast/reservations
Content-Type: application/json

{
  "decorId": "decor-770e8400-e29b-41d4",
  "packOfferId": "pack-aa0e8400-e29b-41d4",
  "supplementIds": ["supp-cc0e8400-e29b-41d4"],
  "themeId": "theme-110e8400-e29b-41d4",
  "podcastDescription": "A podcast about tech startups",
  "requestedDate": "2025-11-25",
  "requestedStartTime": "09:00",
  "customerName": "Alice Dubois",
  "customerEmail": "alice.dubois@example.com",
  "customerPhone": "+33612345678",
  "answers": [
    {
      "questionId": "quest-ff0e8400-e29b-41d4",
      "answerText": "The Growth Lab Podcast"
    }
  ]
}
```

**Response:** Returns reservation ID and pending status.

#### Step 4: View Confirmation (Optional)

After admin confirms, client can view details:

```http
GET /api/v1/client/reservations/CONF-2025-0042/confirmation
```

**Response:** Returns full confirmation details with status.

### Calendar Integration Example

Frontend calendar implementation:

```javascript
// 1. Load form config to get business hours
const configResponse = await fetch('/api/v1/client/podcast/form-config');
const { data: config } = await configResponse.json();

// 2. Display calendar with business hours
const businessHours = config.availabilityConfig.businessHours;

// 3. When user selects a date and pack, check availability
const date = '2025-11-25';
const packId = selectedPack.id;
const availabilityResponse = await fetch(
  `/api/v1/client/podcast/availability?date=${date}&packOfferId=${packId}`
);
const { data: availability } = await availabilityResponse.json();

// 4. Display available slots in green, unavailable in gray
availability.availableSlots.forEach(slot => {
  renderSlot(slot, 'available');
});
availability.unavailableSlots.forEach(slot => {
  renderSlot(slot, 'unavailable');
});
```

### Error Handling Example

Robust error handling for reservation submission:

```javascript
try {
  const response = await fetch('/api/v1/client/podcast/reservations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reservationData)
  });
  
  const result = await response.json();
  
  if (result.success) {
    // Show success message
    showConfirmation(result.data.id);
  } else {
    // Handle error
    const { code, message, details } = result.error;
    
    switch (code) {
      case 'VALIDATION_ERROR':
        // Display field-specific errors
        details.forEach(error => {
          showFieldError(error.field, error.message);
        });
        break;
        
      case 'SLOT_ALREADY_BOOKED':
        // Slot taken, refresh availability
        showError('This time slot was just booked. Please select another time.');
        refreshAvailability();
        break;
        
      default:
        showError(message);
    }
  }
} catch (error) {
  showError('Network error. Please try again.');
}
```

### Form Validation Example

Client-side validation before submission:

```javascript
function validateReservation(formData) {
  const errors = [];
  
  // Validate required fields
  if (!formData.customerName || formData.customerName.length < 1) {
    errors.push({ field: 'customerName', message: 'Name is required' });
  }
  
  if (!formData.customerEmail || !isValidEmail(formData.customerEmail)) {
    errors.push({ field: 'customerEmail', message: 'Valid email is required' });
  }
  
  if (!formData.packOfferId) {
    errors.push({ field: 'packOfferId', message: 'Please select a package' });
  }

  if (!formData.themeId && !formData.customTheme) {
    errors.push({ field: 'themeId', message: 'Please select a theme or provide a custom one' });
  }

  if (!formData.podcastDescription) {
    errors.push({ field: 'podcastDescription', message: 'Please provide a podcast description' });
  }
  
  if (!formData.requestedDate || !isValidDate(formData.requestedDate)) {
    errors.push({ field: 'requestedDate', message: 'Valid date is required' });
  }
  
  if (!formData.requestedStartTime || !isValidTime(formData.requestedStartTime)) {
    errors.push({ field: 'requestedStartTime', message: 'Valid time is required' });
  }
  
  // Validate answers for required questions
  const requiredQuestions = questions.filter(q => q.isRequired);
  requiredQuestions.forEach(question => {
    const answer = formData.answers.find(a => a.questionId === question.id);
    if (!answer || (!answer.answerText && !answer.answerOptionIds?.length)) {
      errors.push({ 
        field: `answers.${question.id}`, 
        message: `${question.label} is required` 
      });
    }
  });
  
  return errors;
}
```

---

## Best Practices

### 1. Availability Checking

- **Always check availability** before showing time slots to users
- **Refresh availability** when user changes the selected pack (duration changes)
- **Re-validate availability** just before submission to prevent race conditions
- **Cache availability** for 30-60 seconds to reduce server load

### 2. Form Handling

- **Pre-validate** on the client side before submission
- **Show clear error messages** for each field
- **Disable submit button** during submission to prevent duplicates
- **Handle network errors** gracefully with retry options

### 3. User Experience

- **Show loading states** during API calls
- **Provide immediate feedback** for user actions
- **Display total price** as user selects packs and supplements
- **Confirm before submission** with a summary of selections

### 4. Performance

- **Load form config once** on page load and cache it
- **Debounce availability checks** when user is selecting dates
- **Use optimistic UI updates** where appropriate
- **Implement request cancellation** for outdated requests

### 5. Security

- **Sanitize user input** before submission
- **Validate email format** on client and server
- **Limit request frequency** to prevent abuse
- **Never expose sensitive data** in client-side code

---

## Changelog

### Version 1.0 (2025-11-21)
- Initial release
- Complete client-facing API specification
- Four main endpoints: form config, availability, create reservation, confirmation
- Comprehensive error handling documentation
- Workflow examples and best practices

---

## Support

For technical questions or issues with the API:
- **Email:** dev@mindak.agency
- **Documentation:** See `ADMIN_FRONTEND_API_SPEC.md` for admin endpoints
- **Status Page:** Check system status at status.mindak.agency

---

**End of Document**
