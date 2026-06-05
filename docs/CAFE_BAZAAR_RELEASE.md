# چک‌لیست انتشار کافه‌بازار — فریلنس پلاس

## ۱. پکیج‌های موبایل

### نصب‌شده
| پکیج | کاربرد |
|------|--------|
| `expo-secure-store` | ذخیره JWT و purchase token |
| `expo-crypto` | deviceId |

### نصب برای Production Build (Android)
```bash
npx expo install expo-cafebazaar-billing
# یا (نیاز به prebuild / dev client):
npm install @cafebazaar/react-native-poolakey
```

> **توصیه Expo:** از `expo-cafebazaar-billing` استفاده کنید — با EAS Build سازگارتر است.

---

## ۲. متغیرهای محیطی

فایل `.env` (یا EAS Secrets):

```env
EXPO_PUBLIC_API_URL=https://api.yourdomain.com
EXPO_PUBLIC_BAZAAR_RSA_KEY=-----BEGIN PUBLIC KEY-----...
```

---

## ۳. ساختار سرویس‌ها (پیاده‌سازی شده)

```
src/services/
├── api/ApiClient.ts
├── api/types.ts
├── auth/AuthService.ts
├── auth/OtpService.ts
├── auth/DeviceService.ts
├── storage/StorageService.ts
├── billing/BazaarBillingService.ts
├── billing/subscriptionPlans.ts
├── subscription/SubscriptionService.ts
└── subscription/SubscriptionSyncService.ts

src/stores/authStore.ts
src/hooks/useAuth.ts
src/hooks/useSubscription.ts

src/modules/auth/
├── LoginScreen.tsx
├── OtpScreen.tsx
└── AuthNavigator.tsx
```

---

## ۴. EAS Build

```bash
# Development build (برای تست Poolakey — Expo Go کافی نیست)
eas build --platform android --profile preview

# Production AAB برای کافه‌بازار
eas build --platform android --profile production
```

در `eas.json` Secrets را تنظیم کنید:
- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_BAZAAR_RSA_KEY`

---

## ۵. پنل کافه‌بازار

- [ ] ثبت اپ با package: `com.freelancerpro.app`
- [ ] ایجاد ۳ اشتراک (ماهانه / ۳ماهه / سالانه)
- [ ] Product IDها دقیقاً مطابق `subscriptionPlans.ts`
- [ ] دریافت RSA Public Key
- [ ] تست Sandbox با حساب تست بازار

---

## ۶. تست قبل از انتشار

### OTP
- [ ] ارسال OTP با SMS.ir واقعی
- [ ] انقضای ۲ دقیقه
- [ ] Rate limit
- [ ] ورود خودکار بعد از verify
- [ ] Logout

### Billing
- [ ] خرید موفق هر ۳ پلن
- [ ] لغو خرید توسط کاربر
- [ ] خطای شبکه
- [ ] Restore purchases
- [ ] Verify token روی سرور Laravel

### Premium
- [ ] PDF/PNG بعد از خرید
- [ ] محدودیت Free قبل از خرید
- [ ] انقضای اشتراک → بازگشت به Free
- [ ] آفلاین: استفاده از آخرین وضعیت cache

### داده مالی
- [ ] همه داده‌ها فقط SQLite محلی
- [ ] بک‌آپ JSON کار می‌کند
- [ ] بدون ارسال فاکتور/مشتری به سرور

---

## ۷. Android Release

- [ ] `eas build --profile production` → AAB
- [ ] ProGuard/R8 فعال (EAS default)
- [ ] `versionCode` افزایش یابد
- [ ] آیکون و اسکرین‌شات فارسی
- [ ] سیاست حریم خصوصی (ذخیره محلی + OTP)

---

## ۸. Security Checklist (Mobile)

- [x] JWT در Secure Store (نه AsyncStorage)
- [x] purchase_token در Secure Store
- [x] API Key SMS در سرور (نه اپ)
- [x] SSL enforced (HTTPS API)
- [x] Token refresh on 401
- [x] Offline cache با lastValidationAt
- [ ] Certificate pinning (اختیاری فاز ۲)

---

## ۹. Known Limitations

| مورد | توضیح |
|------|--------|
| Expo Go | خرید بازار کار نمی‌کند — نیاز به dev/production build |
| Web | پرداخت از **زیبال** (درگاه وب) — OTP لازم |
| Android APK | پرداخت از **کافه‌بازار** (Poolakey) |
| iOS | فعلاً بدون IAP |
