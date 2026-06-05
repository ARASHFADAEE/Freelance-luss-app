# Laravel Backend — OTP, SMS.ir, Cafe Bazaar

این سند تکمیل `BACKEND_API.md` برای تیم Laravel است.

---

## پکیج‌های پیشنهادی Laravel

```bash
composer require laravel/sanctum
composer require guzzlehttp/guzzle
```

---

## ENV

```env
SMS_IR_API_KEY=
SMS_IR_TEMPLATE_ID=100000   # قالب OTP در پنل SMS.ir
SMS_IR_LINE_NUMBER=

ZIBAL_MERCHANT=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
ZIBAL_CALLBACK_URL=https://api.yourdomain.com/api/webhooks/zibal

CAFEBAZAAR_CLIENT_ID=
CAFEBAZAAR_CLIENT_SECRET=
CAFEBAZAAR_PACKAGE_NAME=com.freelancerpro.app

JWT_ACCESS_TTL=3600
JWT_REFRESH_TTL=2592000
OTP_TTL_SECONDS=120
OTP_MAX_SEND_PER_15MIN=3
OTP_MAX_VERIFY_ATTEMPTS=5
```

---

## Migration — users

```php
Schema::create('users', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('phone', 11)->unique();
    $table->string('full_name')->nullable();
    $table->timestamp('phone_verified_at')->nullable();
    $table->boolean('is_blocked')->default(false);
    $table->timestamp('blocked_until')->nullable();
    $table->timestamps();
});
```

## Migration — otp_codes

```php
Schema::create('otp_codes', function (Blueprint $table) {
    $table->id();
    $table->string('phone', 11)->index();
    $table->string('code_hash');
    $table->timestamp('expires_at');
    $table->unsignedTinyInteger('attempts')->default(0);
    $table->timestamps();
});
```

## Migration — refresh_tokens

```php
Schema::create('refresh_tokens', function (Blueprint $table) {
    $table->id();
    $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
    $table->string('device_id');
    $table->string('token_hash')->unique();
    $table->timestamp('expires_at');
    $table->timestamps();
    $table->unique(['user_id', 'device_id']);
});
```

## Migration — subscriptions

```php
Schema::create('subscriptions', function (Blueprint $table) {
    $table->id();
    $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
    $table->string('platform')->default('cafebazaar');
    $table->string('product_id');
    $table->string('subscription_type'); // pro_monthly | pro_quarterly | pro_yearly
    $table->string('purchase_token')->unique();
    $table->timestamp('expires_at')->nullable();
    $table->boolean('active')->default(true);
    $table->timestamps();
});
```

---

## SMS.ir — OtpSmsService

```php
namespace App\Services;

use Illuminate\Support\Facades\Http;

class OtpSmsService
{
    public function send(string $phone, string $code): void
    {
        $response = Http::withHeaders([
            'X-API-KEY' => config('services.sms_ir.api_key'),
        ])->post('https://api.sms.ir/v1/send/verify', [
            'mobile' => $phone,
            'templateId' => config('services.sms_ir.template_id'),
            'parameters' => [
                ['name' => 'Code', 'value' => $code],
            ],
        ]);

        if (!$response->successful()) {
            throw new \RuntimeException('SMS send failed');
        }
    }
}
```

---

## Routes — api.php

```php
Route::prefix('auth')->group(function () {
    Route::post('send-otp', [AuthController::class, 'sendOtp'])->middleware('throttle:otp-send');
    Route::post('verify-otp', [AuthController::class, 'verifyOtp'])->middleware('throttle:otp-verify');
    Route::post('refresh', [AuthController::class, 'refresh']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('me', [AuthController::class, 'me'])->middleware('auth:sanctum');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('subscriptions/verify', [SubscriptionController::class, 'verifyBazaar']);
    Route::post('subscriptions/checkout', [SubscriptionController::class, 'checkoutZibal']);
    Route::get('subscriptions/checkout/{orderId}', [SubscriptionController::class, 'checkoutStatus']);
});
```

---

## POST /api/auth/send-otp

**Logic:**
1. Validate phone `09xxxxxxxxx`
2. Rate limit: 3 / 15 min per phone + IP
3. Generate 6-digit code, hash with bcrypt
4. Send via SMS.ir
5. Store in `otp_codes` with `expires_at = now()+120s`
6. In `local`/`staging`: return `debugCode`

---

## POST /api/auth/verify-otp

**Request:** `{ phone, code, deviceId }`

**Logic:**
1. Find latest valid OTP
2. Compare hash, increment attempts
3. Create/update user
4. Issue JWT access + refresh (hash refresh in DB)
5. Return user + subscription payload

---

## POST /api/subscriptions/verify

**Request:**
```json
{
  "purchase_token": "...",
  "product_id": "freelancerpro_pro_yearly",
  "platform": "cafebazaar"
}
```

**Logic:**
1. Call Cafe Bazaar Developer API to validate token
2. Map `product_id` → duration
3. Upsert `subscriptions` row
4. Return:

```json
{
  "active": true,
  "expires_at": "2027-06-05T00:00:00Z",
  "subscription_type": "pro_yearly",
  "user_access": "premium"
}
```

---

## GET /api/auth/me

Return user + current subscription (same shape as verify-otp response subscription block).

---

## Security checklist (Backend)

- [ ] OTP stored as hash only
- [ ] Refresh token stored as hash only
- [ ] Rate limiting on send/verify
- [ ] Block abusive phones (`is_blocked`, `blocked_until`)
- [ ] HTTPS only
- [ ] Validate Bazaar token server-side (never trust client alone)
- [ ] Audit log for auth events
- [ ] CORS whitelist for web app domain

---

## Product IDs (must match app)

| product_id | نوع |
|------------|-----|
| `freelancerpro_pro_monthly` | ماهانه |
| `freelancerpro_pro_3month` | ۳ ماهه |
| `freelancerpro_pro_yearly` | سالانه |

Register these in Cafe Bazaar developer panel as **subscriptions**.

---

## POST /api/subscriptions/checkout (زیبال — وب)

**Request:**
```json
{
  "product_id": "freelancerpro_pro_yearly",
  "platform": "zibal",
  "callback_url": "https://app.example.com/"
}
```

**Logic:**
1. Map `product_id` → amount (تومان)
2. Create `orders` row with status `pending`
3. Call Zibal `POST https://gateway.zibal.ir/v1/request` with merchant, amount, callbackUrl
4. Return `orderId`, `paymentUrl`, `amount`

**Callback (webhook):** `POST /api/webhooks/zibal` — verify با Zibal، فعال‌سازی subscription، redirect کاربر به:
`{callback_url}?subscription=success&order_id={orderId}`

---

## GET /api/subscriptions/checkout/{orderId}

Return status: `pending` | `paid` | `failed` | `expired` + subscription block when paid.

---

## انتخاب درگاه بر اساس پلتفرم

| پلتفرم اپ | درگاه | endpoint |
|-----------|--------|----------|
| Android APK | کافه‌بازار | `POST /api/subscriptions/verify` |
| Web | زیبال | `POST /api/subscriptions/checkout` |
