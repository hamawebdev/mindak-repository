# Admin Podcast Configuration API Integration Guide

This document details the API endpoints for managing the Podcast Reservation Form configuration. This includes managing Decors, Pack Offers (with flexible metadata), Supplement Services, Form Steps, and Form Questions.

## Base URL
`/api/v1/admin/podcast/configuration`

## Authentication
All endpoints require Admin Authentication.
Header: `Authorization: Bearer <token>`

## Common Response Format
Success responses generally follow this structure:
```json
{
  "success": true,
  "data": { ... }
}
```

Error responses:
```json
{
  "success": false,
  "data": null,
  "error": "Error message"
}
```

---

## 1. Decors Management

Manage studio decor options available for selection.

### Upload Decor Image
**POST** `/decors/upload-image`

Upload an image file for a decor. The image will be saved to the server's uploads folder and a URL will be returned that can be used as the `imageUrl` when creating or updating a decor.

**Content-Type:** `multipart/form-data`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | file | Yes | Image file (JPEG, PNG, GIF, WebP, SVG). Max 5MB. |

**Example using FormData (JavaScript):**
```javascript
const formData = new FormData();
formData.append('image', imageFile);

const response = await fetch('/api/v1/admin/podcast/configuration/decors/upload-image', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>'
  },
  body: formData
});
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "imageUrl": "/uploads/decors/1733567890123-abc123def456.jpg"
  }
}
```

**Error Responses:**
- `400 Bad Request` - No file uploaded or invalid file type
- `401 Unauthorized` - Missing or invalid authentication

**Supported Image Types:**
- `image/jpeg`, `image/jpg`
- `image/png`
- `image/gif`
- `image/webp`
- `image/svg+xml`

**Usage Flow:**
1. First, upload the image using this endpoint
2. Receive the `imageUrl` in the response
3. Use the returned `imageUrl` when creating or updating a decor

---

### Create Decor
**POST** `/decors`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Name of the decor |
| `description` | string | No | Description of the decor |
| `imageUrl` | string | No | URL to the decor image (use Upload Decor Image endpoint) |
| `isActive` | boolean | No | Default: true |
| `sortOrder` | number | No | Default: 0 |

```json
{
  "name": "Urban Loft",
  "description": "Modern industrial style",
  "imageUrl": "/uploads/decors/1733567890123-abc123def456.jpg",
  "sortOrder": 1,
  "isActive": true
}
```

### Update Decor
**PUT** `/decors/:id`

**Request Body:**
Same fields as Create, all optional.

### Delete Decor
**DELETE** `/decors/:id`

---

## 2. Packs / Offers Management

Manage podcast recording packages. This entity uses a flexible `metadata` field to store dynamic properties like features, detailed descriptions, etc.

### Pack Metadata Structure
The `metadata` field is an array of objects, each defining a custom field.

| Field | Type | Description |
|-------|------|-------------|
| `key` | string | Unique identifier for the field (e.g., "features", "description") |
| `label` | string | Display label for the field |
| `type` | string | One of: `text`, `textarea`, `number`, `boolean`, `select`, `list` |
| `value` | mixed | The value of the field (string, number, boolean, or array of strings) |

### Create Pack
**POST** `/packs`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Name of the pack |
| `basePrice` | number | Yes | Price in base currency |
| `durationMin` | number | Yes | Duration in minutes |
| `metadata` | array | No | List of metadata items |
| `description` | string | No | **Deprecated** (Use metadata with key="description") |
| `isActive` | boolean | No | Default: true |
| `sortOrder` | number | No | Default: 0 |

```json
{
  "name": "Starter Pack",
  "basePrice": 100.00,
  "durationMin": 60,
  "sortOrder": 1,
  "isActive": true,
  "metadata": [
    {
      "key": "description",
      "label": "Description",
      "value": "Great for beginners. Includes basic recording setup.",
      "type": "textarea"
    },
    {
      "key": "features",
      "label": "Features",
      "value": ["Audio Editing", "Thumbnail Creation", "1 Camera"],
      "type": "list"
    },
    {
      "key": "isPromotional",
      "label": "Promotional Offer",
      "value": true,
      "type": "boolean"
    }
  ]
}
```

### Update Pack
**PUT** `/packs/:id`

**Request Body:**
Same fields as Create, all optional. Note that providing `metadata` will replace the existing metadata array.

### Delete Pack
**DELETE** `/packs/:id`

---

## 3. Supplements Management

Manage additional services (supplements).

### Create Supplement
**POST** `/supplements`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Name of the service |
| `price` | number | Yes | Price in base currency |
| `description` | string | No | Description |
| `isActive` | boolean | No | Default: true |
| `sortOrder` | number | No | Default: 0 |

```json
{
  "name": "Video Recording",
  "description": "4K Video recording of the session",
  "price": 50.00,
  "sortOrder": 1,
  "isActive": true
}
```

### Update Supplement
**PUT** `/supplements/:id`

**Request Body:**
Same fields as Create, all optional.

### Delete Supplement
**DELETE** `/supplements/:id`

---

## 4. Themes Management

Manage podcast themes.

### Create Theme
**POST** `/themes`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Name of the theme |
| `description` | string | No | Description of the theme |
| `isActive` | boolean | No | Default: true |
| `sortOrder` | number | No | Default: 0 |

```json
{
  "name": "Technology",
  "description": "Tech focused theme",
  "isActive": true,
  "sortOrder": 1
}
```

### Update Theme
**PUT** `/themes/:id`

**Request Body:**
Same fields as Create, all optional.

### Delete Theme
**DELETE** `/themes/:id`

---

## 5. Form Steps Management

Manage the steps of the multi-step reservation form. Questions are assigned to these steps.

### Create Step
**POST** `/steps`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Title of the step |
| `description` | string | No | Subtitle or description |
| `orderIndex` | number | No | Order of the step |
| `isActive` | boolean | No | Default: true |

```json
{
  "title": "Customer Details",
  "description": "Basic contact info",
  "orderIndex": 1,
  "isActive": true
}
```

### Update Step
**PUT** `/steps/:id`

**Request Body:**
Same fields as Create, all optional.

### Delete Step
**DELETE** `/steps/:id`

---

## 6. Form Questions Management

Manage the questions asked in the form. Questions can be linked to a Step.

### Get Form Structure
Retrieves all steps with their assigned questions, and a list of unassigned questions.

**GET** `/structure`

**Response Example:**
```json
{
  "success": true,
  "data": {
    "steps": [
      {
        "id": "step-uuid-1",
        "title": "Customer Details",
        "questions": [
           {
             "id": "question-uuid-1",
             "label": "Full Name",
             "fieldName": "customerName",
             "questionType": "text",
             "isRequired": true,
             ...
           }
        ]
      }
    ],
    "unassignedQuestions": []
  }
}
```

### Create Question
**POST** `/questions`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `label` | string | Yes | The question text |
| `fieldName` | string | Yes | Unique internal field name |
| `questionType` | string | Yes | One of: `text`, `textarea`, `select`, `multi_select`, `number` |
| `stepId` | string | No | UUID of the step this question belongs to |
| `isRequired` | boolean | No | Default: false |
| `helpText` | string | No | Helper text for the user |
| `orderIndex` | number | No | Sort order within the step |
| `isActive` | boolean | No | Default: true |

```json
{
  "label": "Podcast Name",
  "fieldName": "podcastName",
  "questionType": "text",
  "isRequired": true,
  "stepId": "step-uuid-...",
  "orderIndex": 1
}
```

### Update Question
**PUT** `/questions/:id`

**Request Body:**
Same fields as Create, all optional.

### Delete Question
**DELETE** `/questions/:id`

---

## Mandatory System Questions

The following questions are **Mandatory** and cannot be deleted from the system, as they map to core reservation fields:

1. **Customer Name** (`fieldName`: `customerName`)
2. **Customer Email** (`fieldName`: `customerEmail`)
3. **Customer Phone Number** (`fieldName`: `customerPhone`)

Attempting to delete these questions will result in an error.

## Migration Notes

- **Steps & Questions**: The new system uses `PodcastFormStep` to organize questions. 
- **Unassigned Questions**: Existing questions without a `stepId` will appear in the `unassignedQuestions` list in the `/structure` endpoint. Admins should assign them to steps using the Update Question endpoint.
