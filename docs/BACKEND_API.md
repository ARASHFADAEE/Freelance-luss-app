# مستندات API بک‌اند — فریلنس پلاس

این سند برای تیم بک‌اند است تا **ورود با OTP** و **سیستم اشتراک Pro** را پیاده‌سازی و به اپ موبایل متصل کنند.

> **پیاده‌سازی Laravel:** جزئیات migration، SMS.ir و Cafe Bazaar در [`LARAVEL_BACKEND.md`](./LARAVEL_BACKEND.md)  
> **انتشار کافه‌بازار:** [`CAFE_BAZAAR_RELEASE.md`](./CAFE_BAZAAR_RELEASE.md)

### مسیرهای API در اپ موبایل (Production)

| عملیات | مسیر (فعلی اپ) | مسیر قدیمی در این سند |
|--------|----------------|------------------------|
| ارسال OTP | `POST /api/auth/send-otp` | `/api/v1/auth/otp/send` |
| تأیید OTP | `POST /api/auth/verify-otp` | `/api/v1/auth/otp/verify` |
| تازه‌سازی | `POST /api/auth/refresh` | `/api/v1/auth/refresh` |
| خروج | `POST /api/auth/logout` | `/api/v1/auth/logout` |
| پروفایل | `GET /api/auth/me` | — |
| تأیید خرید بازار | `POST /api/subscriptions/verify` | — |
| checkout زیبال (وب) | `POST /api/subscriptions/checkout` | `/api/v1/subscription/checkout` |
| وضعیت سفارش زیبال | `GET /api/subscriptions/checkout/{orderId}` | — |

بک‌اند باید مسیرهای **ستون وسط** را پیاده کند.

---

## ۱. نمای کلی

| مورد | مقدار |
|------|--------|
| نام اپ | فریلنس پلاس |
| پلتفرم فعلی | React Native / Expo — موبایل (Android/iOS) و **وب** (Expo Web) |
| ذخیره‌سازی داده | **لوکال** — SQLite (`expo-sqlite`) روی موبایل؛ روی وب در **IndexedDB مرورگر** (همان فایل `freelancerpro.db`) |
| احراز هویت هدف | OTP با شماره موبایل ایران (`09xxxxxxxxx`) |
| اشتراک | `free` و `pro` |
| قیمت Pro (فعلی در اپ) | ۶۹۰٬۰۰۰ تومان / سال |

اپ فعلاً داده‌های مالی را **لوکال** نگه می‌دارد. پس از اتصال بک‌اند، حداقل این موارد باید سینک شوند:

- هویت کاربر (JWT)
- وضعیت اشتراک (`plan`, `expiresAt`)
- (اختیاری فاز بعد) پروفایل ابری، پرداخت درگاه، بازیابی داده

---

## ۲. احراز هویت — OTP

### ۲.۱ ارسال کد

```http
POST /api/v1/auth/otp/send
Content-Type: application/json
```

**Request:**
```json
{
  "phone": "09121234567"
}
```

**Response 200:**
```json
{
  "success": true,
  "expiresIn": 120,
  "message": "کد تأیید ارسال شد"
}
```

**قوانین:**
- شماره باید ۱۱ رقم و با `09` شروع شود
- کد ۵ یا ۶ رقمی، اعتبار ۲ دقیقه
- محدودیت نرخ: حداکثر ۳ درخواست در ۱۵ دقیقه برای هر شماره
- در محیط `development` می‌توان `debugCode` برگرداند

---

### ۲.۲ تأیید کد و دریافت توکن

```http
POST /api/v1/auth/otp/verify
Content-Type: application/json
```

**Request:**
```json
{
  "phone": "09121234567",
  "code": "123456",
  "deviceId": "uuid-from-app"
}
```

**Response 200:**
```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "expiresIn": 3600,
  "user": {
    "id": "usr_abc123",
    "phone": "09121234567",
    "fullName": null,
    "isNewUser": true
  },
  "subscription": {
    "plan": "free",
    "expiresAt": null,
    "features": {
      "maxClients": 3,
      "maxProjects": 5,
      "maxInvoices": 10,
      "pdfExport": false,
      "reports": false,
      "backup": false,
      "charts": false,
      "multiCurrency": false
    }
  }
}
```

**خطاها:**
| کد | معنی |
|----|------|
| 400 | کد نامعتبر یا منقضی |
| 429 | تلاش بیش از حد |
| 401 | شماره یا کد اشتباه |

---

### ۲.۳ تازه‌سازی توکن

```http
POST /api/v1/auth/refresh
Content-Type: application/json
```

```json
{
  "refreshToken": "eyJhbG..."
}
```

**Response 200:** مشابه verify (بدون `user.isNewUser`)

---

### ۲.۴ خروج

```http
POST /api/v1/auth/logout
Authorization: Bearer {accessToken}
```

```json
{
  "refreshToken": "eyJhbG..."
}
```

---

## ۳. مدل کاربر (پیشنهادی)

```sql
users (
  id            UUID PRIMARY KEY,
  phone         VARCHAR(11) UNIQUE NOT NULL,
  full_name     VARCHAR(255),
  created_at    TIMESTAMPTZ,
  updated_at    TIMESTAMPTZ
)

otp_codes (
  id            UUID PRIMARY KEY,
  phone         VARCHAR(11),
  code_hash     VARCHAR(255),
  expires_at    TIMESTAMPTZ,
  attempts      INT DEFAULT 0,
  created_at    TIMESTAMPTZ
)

refresh_tokens (
  id            UUID PRIMARY KEY,
  user_id       UUID REFERENCES users(id),
  token_hash    VARCHAR(255),
  device_id     VARCHAR(255),
  expires_at    TIMESTAMPTZ,
  revoked_at    TIMESTAMPTZ
)
```

---

## ۴. سیستم اشتراک

### ۴.۱ پلن‌ها

| پلن | محدودیت‌ها | امکانات |
|-----|------------|---------|
| `free` | ۳ مشتری، ۵ پروژه، ۱۰ فاکتور | پایه |
| `pro` | نامحدود | PDF/PNG، گزارش، نمودار، پشتیبان، چند ارزی |

این مقادیر در اپ در `FREE_PLAN_LIMITS` و `subscriptionStore` تعریف شده‌اند.

---

### ۴.۲ دریافت وضعیت اشتراک

```http
GET /api/v1/subscription
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "plan": "pro",
  "expiresAt": "2027-06-05T10:00:00.000Z",
  "isActive": true,
  "features": {
    "maxClients": null,
    "maxProjects": null,
    "maxInvoices": null,
    "pdfExport": true,
    "reports": true,
    "backup": true,
    "charts": true,
    "multiCurrency": true
  }
}
```

`null` در محدودیت‌ها = نامحدود.

---

### ۴.۳ ایجاد سفارش پرداخت — زیبال (وب)

```http
POST /api/subscriptions/checkout
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "product_id": "freelancerpro_pro_yearly",
  "platform": "zibal",
  "callback_url": "https://app.example.com/"
}
```

**Response 200:**
```json
{
  "orderId": "ord_xyz",
  "paymentUrl": "https://gateway.zibal.ir/start/...",
  "amount": 690000,
  "currency": "IRT"
}
```

**جریان:**
1. اپ وب کاربر را به `paymentUrl` هدایت می‌کند
2. پس از پرداخت، زیبال به callback سرور Laravel می‌زند
3. سرور پرداخت را verify می‌کند و کاربر را به `{callback_url}?subscription=success&order_id=ord_xyz` برمی‌گرداند
4. اپ وب با `GET /api/subscriptions/checkout/{orderId}` وضعیت را تأیید و Premium فعال می‌کند

---

### ۴.۴ وضعیت سفارش (بعد از بازگشت از زیبال)

```http
GET /api/subscriptions/checkout/{orderId}
Authorization: Bearer {accessToken}
```

**Response 200 (paid):**
```json
{
  "orderId": "ord_xyz",
  "status": "paid",
  "subscription": {
    "active": true,
    "expires_at": "2027-06-05T00:00:00Z",
    "subscription_type": "pro_yearly",
    "user_access": "premium"
  }
}
```

---

### ۴.۵ ایجاد سفارش پرداخت (درگاه — مسیر قدیمی)

```http
POST /api/v1/subscription/checkout
Authorization: Bearer {accessToken}
Content-Type: application/json
```

```json
{
  "plan": "pro",
  "period": "yearly"
}
```

**Response 200:**
```json
{
  "orderId": "ord_xyz",
  "amount": 690000,
  "currency": "TOMAN",
  "paymentUrl": "https://gateway.example/pay/...",
  "expiresAt": "2026-06-05T11:00:00.000Z"
}
```

---

### ۴.۶ Webhook پرداخت موفق (سرور به سرور)

```http
POST /api/v1/webhooks/payment
X-Webhook-Signature: sha256=...
Content-Type: application/json
```

```json
{
  "event": "payment.succeeded",
  "orderId": "ord_xyz",
  "userId": "usr_abc123",
  "plan": "pro",
  "period": "yearly",
  "paidAt": "2026-06-05T10:30:00.000Z",
  "amount": 690000
}
```

**اقدامات بک‌اند:**
1. تأیید امضای webhook
2. آپدیت `subscriptions` برای کاربر
3. ست کردن `expiresAt` = `paidAt + 1 year`

---

### ۴.۵ مدل اشتراک (پیشنهادی)

```sql
subscriptions (
  id              UUID PRIMARY KEY,
  user_id         UUID UNIQUE REFERENCES users(id),
  plan            VARCHAR(10) DEFAULT 'free',  -- free | pro
  expires_at      TIMESTAMPTZ,
  source          VARCHAR(50),                -- manual | zarinpal | ...
  updated_at      TIMESTAMPTZ
)

subscription_orders (
  id              UUID PRIMARY KEY,
  user_id         UUID REFERENCES users(id),
  plan            VARCHAR(10),
  amount          BIGINT,
  status          VARCHAR(20),  -- pending | paid | failed | expired
  gateway_ref     VARCHAR(255),
  created_at      TIMESTAMPTZ,
  paid_at         TIMESTAMPTZ
)
```

---

## ۵. نگاشت به اپ موبایل

فیلدهای فعلی در SQLite (`app_settings`):

| فیلد محلی | منبع API |
|-----------|----------|
| `subscriptionPlan` | `subscription.plan` |
| `subscriptionExpiresAt` | `subscription.expiresAt` |

**پس از login موفق:**
```typescript
// شبه‌کد — تیم موبایل
await settingsRepository.update({
  subscriptionPlan: response.subscription.plan,
  subscriptionExpiresAt: response.subscription.expiresAt,
});
await useSubscriptionStore.getState().load();
```

**چک Pro در اپ:**
```typescript
canUsePdf: () => plan === 'pro' && (!expiresAt || new Date(expiresAt) > new Date())
```

توصیه: بک‌اند فیلد `isActive` برگرداند تا اپ منقضی‌شده را خودکار Free کند.

---

## ۶. هدرهای استاندارد

```http
Authorization: Bearer {accessToken}
Accept: application/json
Content-Type: application/json
X-App-Version: 1.0.0
X-Platform: android | ios | web
Accept-Language: fa
```

---

## ۷. فرمت خطا

```json
{
  "error": {
    "code": "OTP_EXPIRED",
    "message": "کد تأیید منقضی شده است",
    "details": {}
  }
}
```

کدهای پیشنهادی: `INVALID_PHONE`, `OTP_EXPIRED`, `OTP_INVALID`, `RATE_LIMITED`, `UNAUTHORIZED`, `SUBSCRIPTION_EXPIRED`, `PAYMENT_FAILED`

---

## ۸. امنیت

- ذخیره OTP و refresh token به صورت **hash** (bcrypt/argon2)
- JWT کوتاه‌عمر (۱ ساعت) + refresh token بلندمدت (۳۰ روز)
- امضای webhook با secret مشترک
- HTTPS اجباری
- لاگ نکردن کد OTP در production

---

## ۸. فازهای پیشنهادی پیاده‌سازی

| فاز | کار |
|-----|-----|
| ۱ | OTP + JWT + `GET /subscription` |
| ۲ | درگاه پرداخت + webhook |
| ۳ | سینک پروفایل ابری (اختیاری) |
| ۴ | بک‌آپ ابری داده‌های مالی (اختیاری) |

---

## ۹. وب‌اپ — آیا API جدا لازم است؟

**خیر — همان API این سند برای وب هم کافی است.** تفاوت فقط در هدر `X-Platform: web` است.

| موضوع | وضعیت فعلی وب | نیاز بک‌اند |
|--------|----------------|-------------|
| مشتری، پروژه، فاکتور، پرداخت، هزینه | SQLite در مرورگر (IndexedDB) — **آفلاین‌اول** | فاز ۱: **نیاز ندارد** |
| ورود OTP + اشتراک Pro | هنوز لوکال / دمو | فاز ۱: **همان endpointهای §۲ و §۳** |
| سینک ابری داده‌ها بین دستگاه‌ها | پیاده‌سازی نشده | فاز ۴ (اختیاری) — API جدا برای CRUD ابری |

**نکات مهم برای تیم بک‌اند:**
- برای **فاز اول** (OTP + اشتراک) همین `BACKEND_API.md` کافی است؛ endpoint جدید برای «وب» لازم نیست.
- اگر بعداً **وب‌اپ چنددستگاهی** بخواهید (داده در سرور، نه فقط مرورگر)، باید فاز ۴ تعریف شود: `sync/pull`, `sync/push` یا REST کامل روی entityها.
- CORS: دامنه وب‌اپ (مثلاً `https://app.freelancerplus.ir`) باید در بک‌اند whitelist شود.
- `deviceId` در وب می‌تواند از `localStorage` (UUID پایدار) ارسال شود.

**ذخیره‌سازی در مرورگر:**
- داده‌ها روی **همان دستگاه و همان مرورگر** می‌مانند (مثل اپ موبایل روی همان گوشی).
- پاک کردن داده سایت / حالت ناشناس / مرورگر دیگر = داده از بین می‌رود (مگر بک‌آپ JSON یا سینک ابری اضافه شود).
- بک‌آپ فعلی: export/import فایل JSON از داخل اپ (Pro).

---

## ۱۰. تماس با تیم موبایل

پس از آماده شدن `BASE_URL` staging:

1. آدرس API و کلید webhook را اعلام کنید
2. یک کاربر تست با `phone: 09120000000` و OTP ثابت `000000` در staging بسازید
3. تیم موبایل `authService` و `subscriptionService` را به storeهای فعلی وصل می‌کند

**مخزن اپ:** `android-app-freelancer`  
**فایل‌های مرتبط:** `src/stores/subscriptionStore.ts`, `src/database/repositories/settingsRepository.ts`
