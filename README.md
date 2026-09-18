# VentureIQ Core API

VentureIQ Core is the backend API powering the VentureIQ platform — market trends, research, reports, datasets, company data, alerts, and analytics.

**Production API:** `https://ventureiq-chi.vercel.app`
**API Version:** `v1` (for versioned routes)

---

## Table of Contents

- [Overview](#overview)
- [Health & Instance](#health--instance)
- [Authentication](#authentication)
- [Categories](#categories)
- [Market Trends](#market-trends)
- [Market Reports](#market-reports)
- [Research](#research)
- [Datasets](#datasets)
- [File Uploads](#file-uploads)
- [Unified Search](#unified-search)
- [Data Ingestion](#data-ingestion)
- [Companies](#companies)
- [Alerts & Subscriptions](#alerts--subscriptions)
- [Admin](#admin)
- [Analytics](#analytics)
- [Authentication Header](#authentication-header)
- [API Response Convention](#api-response-convention)
- [Complete Endpoint Map](#complete-endpoint-map)
- [Frontend Configuration](#frontend-configuration)

---

## Overview

### Base URLs

**Versioned API**
```text
https://ventureiq-chi.vercel.app/api/v1
```

**Non-versioned API**

Some services currently use non-versioned routes:
```text
https://ventureiq-chi.vercel.app/api
```

---

## Health & Instance

### Get Instance
```http
GET /whoami
```
Full URL: `https://ventureiq-chi.vercel.app/whoami`

**Response**
```json
{
  "instance": "server-hostname"
}
```

### API Health
```http
GET /
```
Full URL: `https://ventureiq-chi.vercel.app/`

**Response**
```json
{
  "status": "ok",
  "message": "VentureIQ Core API is running"
}
```

---

## Authentication

Base: `/api/v1/auth`

| Endpoint | Method | Auth |
|---|---|---|
| `/api/v1/auth/register` | `POST` | Public |
| `/api/v1/auth/login` | `POST` | Public |
| `/api/v1/auth/me` | `GET` | Required |
| `/api/v1/auth/me` | `PATCH` | Required |
| `/api/v1/auth/me/password` | `PATCH` | Required |

Protected requests require:
```http
Authorization: Bearer <TOKEN>
```

---

## Categories

Base: `/api/v1/categories`

| Endpoint | Method | Auth | Role |
|---|---|---|---|
| `/api/v1/categories` | `GET` | Public | — |
| `/api/v1/categories/:id` | `GET` | Public | — |
| `/api/v1/categories` | `POST` | Required | `ADMIN` |
| `/api/v1/categories/:id` | `PATCH` | Required | `ADMIN` |
| `/api/v1/categories/:id` | `DELETE` | Required | `ADMIN` |

---

## Market Trends

Base: `/api/v1/trends`

| Endpoint | Method | Auth | Role |
|---|---|---|---|
| `/api/v1/trends` | `GET` | Public | — |
| `/api/v1/trends/:id` | `GET` | Public | — |
| `/api/v1/trends` | `POST` | Required | `ADMIN` |
| `/api/v1/trends/:id` | `PATCH` | Required | `ADMIN` |
| `/api/v1/trends/:id` | `DELETE` | Required | `ADMIN` |

---

## Market Reports

Base: `/api/v1/reports`

| Endpoint | Method | Auth | Role |
|---|---|---|---|
| `/api/v1/reports` | `GET` | Optional | — |
| `/api/v1/reports/:id` | `GET` | Optional | — |
| `/api/v1/reports` | `POST` | Required | `ADMIN` |
| `/api/v1/reports/:id` | `PATCH` | Required | `ADMIN` |
| `/api/v1/reports/:id` | `DELETE` | Required | `ADMIN` |

---

## Research

Base: `/api/v1/research`

| Endpoint | Method | Auth | Role |
|---|---|---|---|
| `/api/v1/research` | `GET` | Optional | — |
| `/api/v1/research/:id` | `GET` | Optional | — |
| `/api/v1/research` | `POST` | Required | `ADMIN` |
| `/api/v1/research/:id` | `PATCH` | Required | `ADMIN` |
| `/api/v1/research/:id` | `DELETE` | Required | `ADMIN` |

---

## Datasets

Base: `/api/v1/datasets`

| Endpoint | Method | Auth | Role |
|---|---|---|---|
| `/api/v1/datasets` | `GET` | Public | — |
| `/api/v1/datasets/:id` | `GET` | Public | — |
| `/api/v1/datasets` | `POST` | Required | `ADMIN` |
| `/api/v1/datasets/:id` | `PATCH` | Required | `ADMIN` |
| `/api/v1/datasets/:id` | `DELETE` | Required | `ADMIN` |

---

## File Uploads

Base: `/api/v1/uploads`

| Endpoint | Method | Auth | Role |
|---|---|---|---|
| `/api/v1/uploads` | `POST` | Required | `ADMIN` |
| `/api/v1/uploads/report/:reportId` | `GET` | Required | — |
| `/api/v1/uploads/:id/download` | `GET` | Required | — |
| `/api/v1/uploads/:id` | `DELETE` | Required | `ADMIN` |

**Upload File**
```http
POST /api/v1/uploads
Content-Type: multipart/form-data
```
Form field: `file`

---

## Unified Search

Base: `/api/search`

```http
GET /api/search
```

| | |
|---|---|
| Authentication | Optional |
| Rate limiting | `searchRateLimit` |

### Query Parameters

| Parameter | Description |
|---|---|
| `q` | Search query string |
| `limit` | Max number of results |
| `types` | Filter by result type(s) |

Supported result types: `REPORT`, `TREND`, `RESEARCH`

### Examples

```http
GET /api/search?q=embedded+finance
GET /api/search?q=embedded+finance&types=REPORT
GET /api/search?q=embedded+finance&types=TREND
GET /api/search?q=embedded+finance&types=RESEARCH
GET /api/search?q=embedded+finance&types=REPORT,TREND,RESEARCH
GET /api/search?q=embedded+finance&limit=10
```

---

## Data Ingestion

Base: `/api/ingest`

| Endpoint | Method | Auth |
|---|---|---|
| `/api/ingest/reports` | `POST` | Ingestion Auth (`ingestionAuth` middleware) |

---

## Companies

Base: `/api/companies`

| Endpoint | Method | Auth | Role |
|---|---|---|---|
| `/api/companies` | `GET` | Public | — |
| `/api/companies/:id` | `GET` | Public | — |
| `/api/companies` | `POST` | Required | `ADMIN` |
| `/api/companies/:id` | `PATCH` | Required | `ADMIN` |
| `/api/companies/:id` | `DELETE` | Required | `ADMIN` |

---

## Alerts & Subscriptions

Base: `/api/alerts`

| Endpoint | Method | Auth |
|---|---|---|
| `/api/alerts/subscriptions` | `POST` | Required |
| `/api/alerts/subscriptions` | `GET` | Required |
| `/api/alerts/subscriptions/:id` | `DELETE` | Required |
| `/api/alerts` | `GET` | — |
| `/api/alerts/:id/read` | `PATCH` | — |

---

## Admin

Base: `/api/admin`

| Endpoint | Method | Auth | Role |
|---|---|---|---|
| `/api/admin/users` | `GET` | Required | `ADMIN` |
| `/api/admin/users/:id/role` | `PATCH` | Required | `ADMIN` |
| `/api/admin/users/:id/deactivate` | `PATCH` | Required | `ADMIN` |
| `/api/admin/users/:id/reactivate` | `PATCH` | Required | `ADMIN` |

---

## Analytics

Base: `/api/analytics`

| Endpoint | Method |
|---|---|
| `/api/analytics/overview` | `GET` |
| `/api/analytics/reports-by-category` | `GET` |
| `/api/analytics/reports-by-industry` | `GET` |
| `/api/analytics/publishing-trend` | `GET` |
| `/api/analytics/top-subscribed-categories` | `GET` |

---

## Authentication Header

All protected endpoints require a bearer token:

```http
Authorization: Bearer <JWT_TOKEN>
```

**Example**
```bash
curl "https://ventureiq-chi.vercel.app/api/v1/auth/me" \
  -H "Authorization: Bearer $TOKEN"
```

---

## API Response Convention

Successful responses generally follow this shape:

```json
{
  "status": "ok",
  "data": {}
}
```

**Example**
```json
{
  "status": "ok",
  "data": {
    "research": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "count": 0
    }
  }
}
```

Search responses additionally include a `cached` flag:

```json
{
  "status": "ok",
  "data": [],
  "cached": false
}
```

---

## Complete Endpoint Map

| Method | Endpoint | Auth | Role |
| ------ | ------------------------------------------ | -------------- | ----- |
| GET    | `/whoami`                                  | Public         | —     |
| GET    | `/`                                        | Public         | —     |
| POST   | `/api/v1/auth/register`                    | Public         | —     |
| POST   | `/api/v1/auth/login`                       | Public         | —     |
| GET    | `/api/v1/auth/me`                          | Required       | —     |
| PATCH  | `/api/v1/auth/me`                          | Required       | —     |
| PATCH  | `/api/v1/auth/me/password`                 | Required       | —     |
| GET    | `/api/v1/categories`                       | Public         | —     |
| GET    | `/api/v1/categories/:id`                   | Public         | —     |
| POST   | `/api/v1/categories`                       | Required       | ADMIN |
| PATCH  | `/api/v1/categories/:id`                   | Required       | ADMIN |
| DELETE | `/api/v1/categories/:id`                   | Required       | ADMIN |
| GET    | `/api/v1/trends`                           | Public         | —     |
| GET    | `/api/v1/trends/:id`                       | Public         | —     |
| POST   | `/api/v1/trends`                           | Required       | ADMIN |
| PATCH  | `/api/v1/trends/:id`                       | Required       | ADMIN |
| DELETE | `/api/v1/trends/:id`                       | Required       | ADMIN |
| GET    | `/api/v1/reports`                          | Optional       | —     |
| GET    | `/api/v1/reports/:id`                      | Optional       | —     |
| POST   | `/api/v1/reports`                          | Required       | ADMIN |
| PATCH  | `/api/v1/reports/:id`                      | Required       | ADMIN |
| DELETE | `/api/v1/reports/:id`                      | Required       | ADMIN |
| GET    | `/api/v1/research`                         | Optional       | —     |
| GET    | `/api/v1/research/:id`                     | Optional       | —     |
| POST   | `/api/v1/research`                         | Required       | ADMIN |
| PATCH  | `/api/v1/research/:id`                     | Required       | ADMIN |
| DELETE | `/api/v1/research/:id`                     | Required       | ADMIN |
| GET    | `/api/v1/datasets`                         | Public         | —     |
| GET    | `/api/v1/datasets/:id`                     | Public         | —     |
| POST   | `/api/v1/datasets`                         | Required       | ADMIN |
| PATCH  | `/api/v1/datasets/:id`                     | Required       | ADMIN |
| DELETE | `/api/v1/datasets/:id`                     | Required       | ADMIN |
| POST   | `/api/v1/uploads`                          | Required       | ADMIN |
| GET    | `/api/v1/uploads/report/:reportId`         | Required       | —     |
| GET    | `/api/v1/uploads/:id/download`             | Required       | —     |
| DELETE | `/api/v1/uploads/:id`                      | Required       | ADMIN |
| GET    | `/api/search`                              | Optional       | —     |
| POST   | `/api/ingest/reports`                      | Ingestion Auth | —     |
| GET    | `/api/companies`                           | Optional       | —     |
| GET    | `/api/companies/:id`                       | Optional       | —     |
| POST   | `/api/companies`                           | Required       | ADMIN |
| PATCH  | `/api/companies/:id`                       | Required       | ADMIN |
| DELETE | `/api/companies/:id`                       | Required       | ADMIN |
| POST   | `/api/alerts/subscriptions`                | Required       | —     |
| GET    | `/api/alerts/subscriptions`                | Required       | —     |
| DELETE | `/api/alerts/subscriptions/:id`            | Required       | —     |
| GET    | `/api/alerts`                              | —              | —     |
| PATCH  | `/api/alerts/:id/read`                     | —              | —     |
| GET    | `/api/admin/users`                         | Required       | ADMIN |
| PATCH  | `/api/admin/users/:id/role`                | Required       | ADMIN |
| PATCH  | `/api/admin/users/:id/deactivate`          | Required       | ADMIN |
| PATCH  | `/api/admin/users/:id/reactivate`          | Required       | ADMIN |
| GET    | `/api/analytics/overview`                  | —              | —     |
| GET    | `/api/analytics/reports-by-category`       | —              | —     |
| GET    | `/api/analytics/reports-by-industry`       | —              | —     |
| GET    | `/api/analytics/publishing-trend`          | —              | —     |
| GET    | `/api/analytics/top-subscribed-categories` | —              | —     |

---

## Frontend Configuration

For the production frontend (`ventureiq-web`), set the API base URL as follows.

**Production**
```env
VITE_API_URL=https://ventureiq-chi.vercel.app
```

**Local development**
```env
VITE_API_URL=http://localhost:1570
```

This allows the frontend to switch between local and production APIs without changing application code. Example endpoints built from the base URL:

```text
/api/v1/auth/login
/api/v1/reports
/api/v1/trends
/api/v1/research
/api/v1/categories
/api/search
/api/companies
/api/alerts
/api/analytics
/api/admin
```