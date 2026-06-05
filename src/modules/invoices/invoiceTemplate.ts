import type { Client, Invoice, InvoiceItem, Profile, Project } from '@/core/types';
import { formatCurrency } from '@/core/utils/currency';
import { formatJalaliDate, formatPersianNumber } from '@/core/utils/persian';

export interface InvoiceRenderData {
  invoice: Invoice;
  items: InvoiceItem[];
  client: Client;
  profile: Profile;
  project?: Project | null;
}

function getStyles(profile: Profile, skipExternalFonts = false): string {
  const primary = profile.invoicePrimaryColor || '#1e3a8a';
  const accent = profile.invoiceAccentColor || '#10b981';
  const isMinimal = profile.invoiceTemplate === 'minimal';
  const isClassic = profile.invoiceTemplate === 'classic';
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; background: #fff; }
    body {
      font-family: 'IRANYekanX', Tahoma, sans-serif;
      padding: ${isMinimal ? '32px' : '40px'};
      color: #111827;
      direction: rtl;
      font-size: 13px;
      line-height: 1.6;
    }
    .page { max-width: 720px; margin: 0 auto; }
    .header {
      display: flex;
      flex-direction: row-reverse;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
      margin-bottom: 28px;
      padding-bottom: 22px;
      border-bottom: ${isMinimal ? '1px' : '3px'} solid ${primary};
    }
    .brand { flex: 1; text-align: right; min-width: 0; }
    .brand h1 { color: ${primary}; font-size: ${isClassic ? '26px' : '22px'}; font-weight: 700; margin-bottom: 10px; line-height: 1.4; }
    .brand p { color: #6b7280; font-size: 12px; margin: 4px 0; line-height: 1.6; }
    .header-side { flex-shrink: 0; margin-top: 4px; }
    .logo { width: 72px; height: 72px; object-fit: contain; border-radius: 10px; }
    .badge {
      background: ${primary};
      color: #fff;
      padding: 10px 22px;
      border-radius: ${isClassic ? '4px' : '20px'};
      font-weight: 700;
      font-size: 14px;
      text-align: center;
      white-space: nowrap;
    }
    .meta { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
    .meta-box {
      flex: 1;
      min-width: 200px;
      background: ${isMinimal ? '#fff' : '#f8fafc'};
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 14px 16px;
    }
    .meta-box h3 { color: ${primary}; font-size: 12px; font-weight: 700; margin-bottom: 8px; }
    .meta-box p { font-size: 12px; color: #374151; margin: 3px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th {
      background: ${primary};
      color: #fff;
      padding: 10px 8px;
      font-size: 12px;
      font-weight: 600;
      text-align: center;
    }
    td { padding: 10px 8px; text-align: center; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
    tr:nth-child(even) td { background: #f9fafb; }
    .totals { margin-top: 16px; max-width: 280px; margin-right: auto; margin-left: 0; }
    .totals .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6; }
    .totals .grand {
      font-size: 17px;
      font-weight: 700;
      color: ${primary};
      border-top: 2px solid ${primary};
      margin-top: 8px;
      padding-top: 10px;
    }
    .payment-box {
      background: ${accent}15;
      border: 1px solid ${accent}40;
      border-radius: 10px;
      padding: 14px;
      margin-top: 20px;
    }
    .footer-note { margin-top: 24px; text-align: center; color: #6b7280; font-size: 11px; }
    .signatures { margin-top: 48px; display: flex; justify-content: space-between; gap: 40px; }
    .sig { flex: 1; text-align: center; border-top: 1px solid #9ca3af; padding-top: 8px; font-size: 11px; color: #6b7280; }
  `;
}

export function buildInvoiceHtml(data: InvoiceRenderData, options?: { skipExternalFonts?: boolean }): string {
  const { invoice, items, client, profile, project } = data;
  const currency = profile.currency;
  const paidPercent = project && project.totalAmount > 0
    ? Math.round((project.receivedAmount / project.totalAmount) * 100)
    : 0;

  const itemsHtml = items.map((item, i) => `
    <tr>
      <td>${formatPersianNumber(i + 1)}</td>
      <td style="text-align:right;padding-right:12px">${item.title}</td>
      <td>${formatPersianNumber(item.quantity)}</td>
      <td>${formatCurrency(item.unitPrice, currency)}</td>
      <td>${formatCurrency(item.total, currency)}</td>
    </tr>
  `).join('');

  const signatures = profile.invoiceShowSignatures ? `
    <div class="signatures">
      <div class="sig">امضای مشتری</div>
      <div class="sig">مهر و امضای فروشنده</div>
    </div>
  ` : '';

  return `<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=794">
  <style>${getStyles(profile, options?.skipExternalFonts)}</style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="brand">
        <h1>${profile.fullName || 'فریلنسر'}</h1>
        ${profile.phone ? `<p>تلفن: ${profile.phone}</p>` : ''}
        ${profile.email ? `<p>ایمیل: ${profile.email}</p>` : ''}
        ${profile.address ? `<p>${profile.address}</p>` : ''}
        ${profile.website ? `<p>${profile.website}</p>` : ''}
      </div>
      <div class="header-side">
        ${profile.logo ? `<img class="logo" src="${profile.logo}" />` : `<div class="badge">فاکتور رسمی</div>`}
      </div>
    </div>

    <div class="meta">
      <div class="meta-box">
        <h3>اطلاعات فاکتور</h3>
        <p><strong>شماره:</strong> ${invoice.invoiceNumber}</p>
        <p><strong>تاریخ صدور:</strong> ${formatJalaliDate(invoice.issueDate)}</p>
        <p><strong>سررسید:</strong> ${formatJalaliDate(invoice.dueDate)}</p>
      </div>
      <div class="meta-box">
        <h3>خریدار</h3>
        <p><strong>${client.fullName}</strong></p>
        ${client.companyName ? `<p>${client.companyName}</p>` : ''}
        ${client.phone ? `<p>${client.phone}</p>` : ''}
        ${client.email ? `<p>${client.email}</p>` : ''}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width:40px">ردیف</th>
          <th>شرح خدمات / کالا</th>
          <th style="width:60px">تعداد</th>
          <th style="width:100px">قیمت واحد</th>
          <th style="width:100px">مبلغ</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <div class="totals">
      <div class="row"><span>جمع کل</span><span>${formatCurrency(invoice.subtotal, currency)}</span></div>
      ${invoice.discount > 0 ? `<div class="row"><span>تخفیف</span><span>${formatCurrency(invoice.discount, currency)}</span></div>` : ''}
      <div class="row"><span>مالیات</span><span>${formatCurrency(invoice.tax, currency)}</span></div>
      <div class="row grand"><span>قابل پرداخت</span><span>${formatCurrency(invoice.total, currency)}</span></div>
    </div>

    ${project ? `
    <div class="payment-box">
      <p>پرداخت شده: ${formatPersianNumber(paidPercent)}٪ — مانده: ${formatCurrency(project.remainingAmount, currency)}</p>
    </div>
    ` : ''}

    ${profile.invoiceFooterText ? `<div class="footer-note">${profile.invoiceFooterText}</div>` : ''}
    ${signatures}
  </div>
</body>
</html>`;
}
