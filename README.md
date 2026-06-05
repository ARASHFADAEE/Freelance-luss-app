# FreelancerPro

اپلیکیشن مدیریت مالی و حسابداری فریلنسرهای ایرانی

## تکنولوژی

- React Native (Expo SDK 56)
- TypeScript
- SQLite (expo-sqlite) — Offline First
- Zustand + React Query
- React Hook Form + Zod
- React Navigation
- Victory Native (نمودارها)
- React Native Paper (Material Design 3)
- فونت Vazirmatn + RTL کامل

## اجرا

```bash
npm install
npx expo start
```

سپس `a` برای Android یا `i` برای iOS.

## ساختار پروژه

```
src/
├── core/           # تم، تایپ‌ها، ابزارها
├── database/       # SQLite schema و repositories
├── navigation/     # ناوبری
├── shared/         # کامپوننت‌ها و providers
├── stores/         # Zustand stores
└── modules/        # ماژول‌های feature-based
```

## ماژول‌ها

- **Dashboard** — آمار مالی و نمودار ۶ ماهه
- **Clients** — مدیریت کارفرما
- **Projects** — پیگیری پروژه و Progress Bar
- **Payments** — ثبت پرداخت و اقساط
- **Invoices** — صدور فاکتور + PDF/PNG
- **Services** — کاتالوگ خدمات
- **Expenses** — ثبت هزینه‌ها
- **Reports** — گزارش درآمد، مشتری، خدمت
- **Backup** — خروجی/بازیابی JSON
- **Subscription** — Free / Pro
- **Notifications** — یادآوری محلی

## پلن‌ها

| ویژگی | Free | Pro |
|-------|------|-----|
| مشتری | ۳ | نامحدود |
| پروژه | ۵ | نامحدود |
| فاکتور | ۱۰ | نامحدود |
| PDF/PNG | ✗ | ✓ |
| گزارش‌ها | ✗ | ✓ |
| بکاپ | ✗ | ✓ |

## داده نمونه

در اولین اجرا، داده‌های نمونه به‌صورت خودکار seed می‌شوند.
