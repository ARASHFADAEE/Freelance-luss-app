/** Persian accessibility labels — centralized for screen readers */

export const a11y = {
  tab: {
    dashboard: 'داشبورد، خلاصه مالی',
    clients: 'مشتریان',
    projects: 'پروژه‌ها',
    invoices: 'فاکتورها',
    financial: 'مالی، هزینه و گزارش',
    more: 'بیشتر، تنظیمات',
  },
  action: {
    add: 'افزودن',
    save: 'ذخیره',
    search: 'جستجو',
    refresh: 'به‌روزرسانی لیست',
    openMenu: 'باز کردن منوی اقدامات سریع',
    closeMenu: 'بستن منوی اقدامات',
    selectDate: 'انتخاب تاریخ',
    selectClient: 'انتخاب مشتری',
  },
  chart: {
    cashFlow: 'نمودار جریان نقد، درآمد و هزینه',
    expenseBreakdown: 'نمودار تفکیک هزینه‌ها',
  },
  onboarding: {
    skip: 'رد کردن راهنما',
    next: 'صفحه بعد راهنما',
    finish: 'پایان راهنما و شروع اپ',
  },
} as const;
