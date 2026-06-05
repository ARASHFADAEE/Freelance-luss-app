# API همگام‌سازی ابری — فریلنس پلاس

این سند برای **Backend Developer** است تا سیستم **فضای ابری فریلنس پلاس** را پیاده‌سازی کند.

> **Auth / OTP / Subscription:** [`BACKEND_API.md`](./BACKEND_API.md) و [`LARAVEL_BACKEND.md`](./LARAVEL_BACKEND.md)

---

## ۱. نمای کلی

| مورد | مقدار |
|------|--------|
| Base URL | `{API_URL}/api` |
| Auth | JWT Bearer (`Authorization: Bearer {token}`) |
| Format | JSON — UTF-8 |
| User scope | هر رکورد فقط متعلق به `user_id` لاگین‌شده |
| Idempotency | `id` کلاینت (UUID) به عنوان Primary Key سرور |

### دو حالت ذخیره در اپ

| حالت | `data_storage_mode` | رفتار |
|------|---------------------|--------|
| محلی | `local` | SQLite / IndexedDB — API داده مالی **نمی‌خواند/نمی‌نویسد** |
| ابری | `cloud` | CRUD + Sync از API |

---

## ۲. استرategی Sync (پیشنهادی)

### فاز ۱ — Snapshot Sync (ساده‌تر)

```
GET  /api/sync/snapshot          → دریافت همه داده کاربر
POST /api/sync/snapshot          → آپلود کامل (اولین بار / بازیابی)
PUT  /api/sync/snapshot          → جایگزینی کامل
```

### فاز ۲ — Incremental Sync (Production)

```
GET  /api/sync/changes?since={iso8601}   → تغییرات بعد از timestamp
POST /api/sync/push                      → batch upsert + deletes
```

**قوانین conflict:**
- هر رکورد فیلد `updated_at` (ISO8601 UTC)
- **Last-Write-Wins** بر اساس `updated_at` (یا نسخه عددی `version`)
- حذف نرم: `deleted_at` nullable

---

## ۳. ترجیحات کاربر

### GET /api/user/preferences

```json
{
  "data_storage_mode": "cloud",
  "updated_at": "2026-06-05T12:00:00Z"
}
```

### PUT /api/user/preferences

```json
{
  "data_storage_mode": "local"
}
```

**Response 200:** همان ساختار GET

---

## ۴. Snapshot — ساختار کامل

### GET /api/sync/snapshot

**Response 200:**

```json
{
  "version": "1.0.0",
  "synced_at": "2026-06-05T12:00:00Z",
  "profile": { },
  "settings": { },
  "clients": [],
  "projects": [],
  "payments": [],
  "services": [],
  "invoices": [],
  "invoice_items": [],
  "expenses": []
}
```

### POST /api/sync/snapshot

**Request:** همان ساختار بالا (برای migrate از local → cloud)

**Logic:**
1. Validate JWT
2. Transaction: upsert all entities
3. Return `{ "synced_at": "...", "counts": { "clients": 3, ... } }`

---

## ۵. CRUD — مشتریان (Clients)

### GET /api/clients

Query: `?page=1&per_page=50&search=`

```json
{
  "data": [
    {
      "id": "uuid",
      "full_name": "علی رضایی",
      "phone": "09111111111",
      "email": "",
      "company_name": "",
      "notes": "",
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z",
      "deleted_at": null
    }
  ],
  "meta": { "current_page": 1, "last_page": 1, "total": 1 }
}
```

### POST /api/clients

```json
{
  "id": "uuid-from-client",
  "full_name": "علی رضایی",
  "phone": "09111111111",
  "email": "",
  "company_name": "",
  "notes": ""
}
```

### GET /api/clients/{id}

### PUT /api/clients/{id}

### DELETE /api/clients/{id}

Soft delete: `deleted_at = now()`

---

## ۶. CRUD — پروژه‌ها (Projects)

| فیلد | نوع | توضیح |
|------|-----|--------|
| id | UUID | |
| client_id | UUID | FK |
| title | string | |
| description | string | |
| total_amount | number | |
| received_amount | number | |
| remaining_amount | number | محاسبه یا sync |
| start_date | date YYYY-MM-DD | |
| due_date | date | |
| status | enum | negotiating, active, delivered, completed, cancelled |
| created_at | datetime | |
| updated_at | datetime | |

```
GET    /api/projects
POST   /api/projects
GET    /api/projects/{id}
PUT    /api/projects/{id}
DELETE /api/projects/{id}
GET    /api/clients/{clientId}/projects
```

---

## ۷. CRUD — پرداخت‌ها (Payments)

| فیلد | نوع |
|------|-----|
| id | UUID |
| project_id | UUID |
| amount | number |
| payment_date | date |
| description | string |

```
GET    /api/payments?project_id=
POST   /api/payments
PUT    /api/payments/{id}
DELETE /api/payments/{id}
```

**Side effect:** آپدیت `received_amount` / `remaining_amount` پروژه

---

## ۸. CRUD — خدمات (Services)

```
GET/POST   /api/services
GET/PUT/DELETE /api/services/{id}
```

| فیلد | نوع |
|------|-----|
| title | string |
| category | string |
| default_price | number |
| description | string |

---

## ۹. CRUD — فاکتورها (Invoices + Items)

### Invoice

```
GET    /api/invoices?status=&client_id=
POST   /api/invoices
GET    /api/invoices/{id}
PUT    /api/invoices/{id}
DELETE /api/invoices/{id}
```

| فیلد | نوع |
|------|-----|
| invoice_number | string unique per user |
| client_id | UUID |
| project_id | UUID nullable |
| issue_date, due_date | date |
| subtotal, tax, discount, total | number |
| status | draft, sent, paid, overdue, cancelled |
| notes | string |

### Invoice Items

```
GET    /api/invoices/{id}/items
PUT    /api/invoices/{id}/items     → replace all items (array)
```

| فیلد | نوع |
|------|-----|
| id | UUID |
| invoice_id | UUID |
| service_id | UUID nullable |
| title | string |
| quantity | number |
| unit_price | number |
| total | number |

---

## ۱۰. CRUD — هزینه‌ها (Expenses)

```
GET/POST   /api/expenses
GET/PUT/DELETE /api/expenses/{id}
GET    /api/expenses?from=&to=&category=
```

| فیلد | نوع |
|------|-----|
| category | string |
| amount | number |
| description | string |
| date | date |

---

## ۱۱. پروفایل (Profile)

```
GET /api/profile
PUT /api/profile
```

```json
{
  "full_name": "",
  "phone": "",
  "email": "",
  "logo_url": null,
  "address": "",
  "website": "",
  "currency": "TOMAN",
  "tax_rate": 9,
  "invoice_primary_color": "#1e3a8a",
  "invoice_accent_color": "#10b981",
  "invoice_footer_text": "",
  "invoice_show_signatures": true,
  "invoice_template": "modern"
}
```

### POST /api/profile/logo

`multipart/form-data` — آپلود لوگو → `{ "logo_url": "https://..." }`

---

## ۱۲. تنظیمات اپ (Settings — غیر مالی)

```
GET /api/user/app-settings
PUT /api/user/app-settings
```

```json
{
  "dark_mode": false,
  "notifications_enabled": true,
  "onboarding_completed": true
}
```

> `subscription_plan` از `/api/auth/me` — نه این endpoint

---

## ۱۳. گزارش‌ها و Analytics (اختیاری — Server-side)

اپ فعلاً گزارش را **local** محاسبه می‌کند. برای cloud می‌توان endpoint اضافه کرد:

```
GET /api/analytics/dashboard
GET /api/analytics/monthly?months=12
GET /api/analytics/yearly?years=5
GET /api/analytics/clients
GET /api/analytics/services
GET /api/analytics/expenses/breakdown?from=&to=
GET /api/analytics/range?from=&to=
```

**Response dashboard:**

```json
{
  "monthly_revenue": 0,
  "yearly_revenue": 0,
  "monthly_expenses": 0,
  "monthly_profit": 0,
  "outstanding_receivables": 0,
  "active_projects": 0,
  "unpaid_invoices": 0
}
```

---

## ۱۴. Incremental Push (فاز ۲)

### POST /api/sync/push

```json
{
  "client_timestamp": "2026-06-05T12:00:00Z",
  "changes": {
    "clients": {
      "upsert": [ { "id": "...", "full_name": "...", "updated_at": "..." } ],
      "delete": [ "uuid-1", "uuid-2" ]
    },
    "projects": { "upsert": [], "delete": [] },
    "payments": { "upsert": [], "delete": [] },
    "services": { "upsert": [], "delete": [] },
    "invoices": { "upsert": [], "delete": [] },
    "invoice_items": { "upsert": [], "delete": [] },
    "expenses": { "upsert": [], "delete": [] }
  }
}
```

**Response:**

```json
{
  "server_timestamp": "2026-06-05T12:01:00Z",
  "conflicts": [],
  "applied": { "clients": 1, "projects": 0 }
}
```

---

## ۱۵. Migration Laravel — جداول پیشنهادی

```sql
-- user_preferences
user_id UUID PK FK users
data_storage_mode VARCHAR(10) DEFAULT 'local'
updated_at TIMESTAMPTZ

-- clients, projects, payments, services, invoices, invoice_items, expenses
-- each: id UUID PK, user_id UUID FK, ...fields..., created_at, updated_at, deleted_at

-- user_profiles (one row per user)
-- user_app_settings (one row per user)
```

**Index:** `(user_id, updated_at)` روی همه جداول sync

---

## ۱۶. Routes — api.php (خلاصه)

```php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('user/preferences', [UserPreferencesController::class, 'show']);
    Route::put('user/preferences', [UserPreferencesController::class, 'update']);

    Route::get('sync/snapshot', [SyncController::class, 'download']);
    Route::post('sync/snapshot', [SyncController::class, 'upload']);
    Route::get('sync/changes', [SyncController::class, 'changes']);
    Route::post('sync/push', [SyncController::class, 'push']);

    Route::apiResource('clients', ClientController::class);
    Route::apiResource('projects', ProjectController::class);
    Route::apiResource('payments', PaymentController::class);
    Route::apiResource('services', ServiceController::class);
    Route::apiResource('invoices', InvoiceController::class);
    Route::apiResource('expenses', ExpenseController::class);

    Route::get('profile', [ProfileController::class, 'show']);
    Route::put('profile', [ProfileController::class, 'update']);
    Route::post('profile/logo', [ProfileController::class, 'uploadLogo']);

    Route::prefix('analytics')->group(function () {
        Route::get('dashboard', [AnalyticsController::class, 'dashboard']);
        Route::get('monthly', [AnalyticsController::class, 'monthly']);
        // ...
    });
});
```

---

## ۱۷. امنیت

- [ ] همه queryها `where user_id = auth()->id()`
- [ ] Rate limit روی sync/push
- [ ] Max body size snapshot (مثلاً 10MB)
- [ ] Validate UUID ownership قبل از PUT/DELETE
- [ ] Logo upload: mime + size limit
- [ ] **هرگز** داده کاربر A به کاربر B برنگردد

---

## ۱۸. Mapping فیلد اپ ↔ API

| اپ (camelCase) | API (snake_case) |
|----------------|------------------|
| fullName | full_name |
| clientId | client_id |
| projectId | project_id |
| invoiceNumber | invoice_number |
| issueDate | issue_date |
| createdAt | created_at |
| defaultPrice | default_price |
| companyName | company_name |

اپ در cloud mode هر دو format را می‌پذیرد (normalizer مشابه auth).

---

## ۱۹. ترتیب پیاده‌سازی پیشنهادی

1. `user/preferences` (GET/PUT)
2. `profile` (GET/PUT)
3. `clients` CRUD
4. `projects` + `payments`
5. `services`, `expenses`
6. `invoices` + `items`
7. `sync/snapshot`
8. `analytics/*` (اختیاری)
9. `sync/push` incremental

---

## ۲۰. تست با اپ موبایل

1. کاربر جدید → OTP → انتخاب **فضای ابری**
2. اپ `PUT /api/user/preferences` می‌زند
3. پس از پیاده‌سازی snapshot: اولین sync بعد از انتخاب cloud
4. Login روی دستگاه دوم → `GET /api/sync/snapshot` → populate local cache

---

## ۲۱. خطاهای استاندارد

```json
{
  "error": {
    "code": "SYNC_CONFLICT",
    "message": "تعارض در همگام‌سازی",
    "details": { "entity": "clients", "id": "..." }
  }
}
```

| code | HTTP |
|------|------|
| UNAUTHORIZED | 401 |
| FORBIDDEN | 403 |
| NOT_FOUND | 404 |
| VALIDATION_ERROR | 422 |
| SYNC_CONFLICT | 409 |
| RATE_LIMITED | 429 |
