# API پاک‌سازی داده — فریلنس پلاس

این سند برای **Backend Developer** است تا endpoint **ریست داده مالی** را پیاده کند؛ وقتی کاربر در اپ روی «پاک‌سازی همه داده‌ها» در تنظیمات می‌زند.

> **Auth / OTP:** [`BACKEND_API.md`](./BACKEND_API.md)  
> **CRUD و Snapshot کامل:** [`CLOUD_SYNC_API.md`](./CLOUD_SYNC_API.md)

---

## ۱. چه زمانی فراخوانی می‌شود؟

| شرط | رفتار اپ |
|-----|----------|
| `data_storage_mode = local` | فقط SQLite/IndexedDB محلی پاک می‌شود — **API صدا زده نمی‌شود** |
| `data_storage_mode = cloud` و JWT معتبر | ابتدا `DELETE /api/sync/data` سپس پاک‌سازی محلی |
| API در دسترس نباشد | اپ ریست محلی را ادامه می‌دهد (fail-open) |

---

## ۲. Endpoint پیشنهادی

### `DELETE /api/sync/data`

**Auth:** `Authorization: Bearer {access_token}` — middleware `auth:api` / JWT

**Request body:** ندارد

**Response 200:**

```json
{
  "message": "All business data deleted",
  "deleted_at": "2026-06-05T14:30:00Z",
  "counts": {
    "clients": 12,
    "projects": 8,
    "payments": 15,
    "services": 5,
    "invoices": 10,
    "invoice_items": 24,
    "expenses": 7
  }
}
```

**Response 401:** توکن نامعتبر

**Response 403:** کاربر مجاز نیست

---

## ۳. منطق سرور (Laravel)

### ۳.۱ داده‌هایی که باید حذف شوند

| Entity | توضیح |
|--------|--------|
| `clients` | همه مشتریان کاربر |
| `projects` | همه پروژه‌ها |
| `payments` | همه پرداخت‌ها |
| `services` | همه خدمات |
| `invoices` | همه فاکتورها |
| `invoice_items` | آیتم‌های فاکتور |
| `expenses` | همه هزینه‌ها |

### ۳.۲ داده‌هایی که **نباید** حذف شوند

| Entity | دلیل |
|--------|------|
| `users` | حساب کاربری |
| JWT / refresh tokens | احراز هویت |
| `subscriptions` | اشتراک Pro |
| `user_preferences.data_storage_mode` | ترجیح ذخیره‌سازی |
| پروفایل کسب‌وکار (`profile` / `business_profile`) | نام، لوگو، مالیات — در اپ محلی حفظ می‌شود |

### ۳.۳ پیاده‌سازی نمونه

```php
// routes/api.php
Route::middleware('auth:api')->group(function () {
    Route::delete('/sync/data', [SyncController::class, 'purgeAllData']);
});
```

```php
// app/Http/Controllers/Api/SyncController.php
public function purgeAllData(Request $request)
{
    $userId = $request->user()->id;

    return DB::transaction(function () use ($userId) {
        $counts = [
            'invoice_items' => InvoiceItem::whereHas('invoice', fn ($q) => $q->where('user_id', $userId))->delete(),
            'invoices'       => Invoice::where('user_id', $userId)->delete(),
            'payments'       => Payment::where('user_id', $userId)->delete(),
            'projects'       => Project::where('user_id', $userId)->delete(),
            'clients'        => Client::where('user_id', $userId)->delete(),
            'services'       => Service::where('user_id', $userId)->delete(),
            'expenses'       => Expense::where('user_id', $userId)->delete(),
        ];

        return response()->json([
            'message'    => 'All business data deleted',
            'deleted_at' => now()->toIso8601String(),
            'counts'     => $counts,
        ]);
    });
}
```

> **Soft delete:** اگر از `deleted_at` استفاده می‌کنید، به‌جای `delete()` مقدار `deleted_at = now()` بگذارید. اپ بعداً با `GET /api/sync/snapshot` آرایه‌های خالی دریافت می‌کند.

---

## ۴. جایگزین: Snapshot خالی

اگر endpoint جدا نمی‌خواهید:

### `PUT /api/sync/snapshot`

**Request:**

```json
{
  "version": "1.0.0",
  "clients": [],
  "projects": [],
  "payments": [],
  "services": [],
  "invoices": [],
  "invoice_items": [],
  "expenses": []
}
```

**Logic:** Transaction — حذف همه رکوردهای قبلی کاربر + insert خالی (یا skip). `profile` و `settings` اختیاری — اگر ارسال نشوند، تغییر نکنند.

برای سادگی اپ، **`DELETE /api/sync/data`** ترجیح داده شده است.

---

## ۵. Route در Laravel

```php
Route::prefix('sync')->middleware('auth:api')->group(function () {
    Route::get('/snapshot', [SyncController::class, 'snapshot']);
    Route::post('/snapshot', [SyncController::class, 'storeSnapshot']);
    Route::put('/snapshot', [SyncController::class, 'replaceSnapshot']);
    Route::delete('/data', [SyncController::class, 'purgeAllData']);  // ← جدید
});
```

---

## ۶. تست با curl

```bash
curl -X DELETE "https://your-api.com/api/sync/data" \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Accept: application/json"
```

بعد از موفقیت:

```bash
curl "https://your-api.com/api/sync/snapshot" \
  -H "Authorization: Bearer YOUR_JWT"
```

انتظار: همه آرایه‌های entity خالی (`[]`).

---

## ۷. نکات امنیتی

1. **فقط داده همان `user_id`** — هرگز cross-user delete
2. **Rate limit** — مثلاً حداکثر ۳ بار در ساعت (جلوگیری از abuse)
3. **Audit log** (اختیاری) — `user_id`, `ip`, `deleted_at` در جدول `data_purge_logs`
4. **Idempotent** — فراخوانی مجدد باید 200 برگرداند (حتی اگر قبلاً خالی شده)

---

## ۸. تغییرات اپ (انجام‌شده)

| فایل | نقش |
|------|-----|
| `src/database/connection.ts` | `clearBusinessData()` — DELETE از جداول مالی |
| `src/services/data/dataResetService.ts` | ریست محلی + `DELETE /api/sync/data` در حالت cloud |
| `src/modules/settings/DataResetSettingsSection.tsx` | دکمه در تنظیمات |
| `src/core/utils/confirm.ts` | دیالوگ تأیید |

---

## ۹. Checklist بک‌اند

- [ ] `DELETE /api/sync/data` با JWT
- [ ] حذف scoped به `user_id`
- [ ] حفظ users / subscriptions / preferences
- [ ] Response JSON با `deleted_at`
- [ ] تست: snapshot بعد از purge خالی است
