import { clientRepository } from './repositories/clientRepository';
import { projectRepository } from './repositories/projectRepository';
import { paymentRepository } from './repositories/paymentRepository';
import { serviceRepository } from './repositories/serviceRepository';
import { expenseRepository } from './repositories/expenseRepository';
import { profileRepository } from './repositories/profileRepository';
import { invoiceRepository } from './repositories/invoiceRepository';
import { addDaysISO, todayISO } from '@/core/utils/persian';

export async function seedSampleData(): Promise<void> {
  const clientCount = await clientRepository.count();
  if (clientCount > 0) return;

  await profileRepository.update({
    fullName: 'آرش محمدی',
    phone: '۰۹۱۲۳۴۵۶۷۸۹',
    email: 'arash@example.com',
    address: 'تهران، ایران',
    website: 'arashdev.ir',
  });

  const client1 = await clientRepository.create({
    fullName: 'علی رضایی',
    phone: '۰۹۱۱۱۱۱۱۱۱۱',
    email: 'ali@company.ir',
    companyName: 'شرکت فناوری نوین',
    notes: 'مشتری وفادار',
  });

  const client2 = await clientRepository.create({
    fullName: 'سارا احمدی',
    phone: '۰۹۱۲۲۲۲۲۲۲۲',
    email: 'sara@startup.ir',
    companyName: 'استارتاپ دیجیتال',
    notes: '',
  });

  const service1 = await serviceRepository.create({
    title: 'طراحی سایت شرکتی',
    category: 'طراحی وب',
    defaultPrice: 25_000_000,
    description: 'طراحی و پیاده‌سازی وب‌سایت شرکتی',
  });

  const service2 = await serviceRepository.create({
    title: 'سئو ماهانه',
    category: 'سئو',
    defaultPrice: 5_000_000,
    description: 'بهینه‌سازی موتورهای جستجو',
  });

  const service3 = await serviceRepository.create({
    title: 'طراحی UI/UX',
    category: 'طراحی UI/UX',
    defaultPrice: 15_000_000,
    description: 'طراحی رابط کاربری',
  });

  const project1 = await projectRepository.create({
    clientId: client1.id,
    title: 'وب‌سایت شرکتی',
    description: 'طراحی و توسعه وب‌سایت شرکتی با پنل مدیریت',
    totalAmount: 35_000_000,
    startDate: addDaysISO(todayISO(), -60),
    dueDate: addDaysISO(todayISO(), 30),
    status: 'active',
  });

  const project2 = await projectRepository.create({
    clientId: client2.id,
    title: 'اپلیکیشن موبایل',
    description: 'توسعه اپلیکیشن iOS و Android',
    totalAmount: 80_000_000,
    startDate: addDaysISO(todayISO(), -30),
    dueDate: addDaysISO(todayISO(), 60),
    status: 'negotiating',
  });

  await paymentRepository.create({
    projectId: project1.id,
    amount: 15_000_000,
    paymentDate: addDaysISO(todayISO(), -45),
    description: 'پیش‌پرداخت',
  });

  await paymentRepository.create({
    projectId: project1.id,
    amount: 10_000_000,
    paymentDate: addDaysISO(todayISO(), -15),
    description: 'قسط اول',
  });

  await expenseRepository.create({
    category: 'هاست',
    amount: 500_000,
    description: 'هاست سالانه',
    date: addDaysISO(todayISO(), -10),
  });

  await expenseRepository.create({
    category: 'Cursor',
    amount: 600_000,
    description: 'اشتراک ماهانه',
    date: addDaysISO(todayISO(), -5),
  });

  await invoiceRepository.create(
    {
      clientId: client1.id,
      projectId: project1.id,
      issueDate: addDaysISO(todayISO(), -20),
      dueDate: addDaysISO(todayISO(), 10),
      subtotal: 25_000_000,
      tax: 2_250_000,
      discount: 0,
      total: 27_250_000,
      status: 'sent',
      notes: '',
    },
    [
      {
        serviceId: service1.id,
        title: service1.title,
        quantity: 1,
        unitPrice: 25_000_000,
        total: 25_000_000,
      },
    ],
  );
}
