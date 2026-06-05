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

export const INVOICE_EXPORT_WIDTH_PX = 794;
export const INVOICE_EXPORT_MIN_HEIGHT_PX = 1123;

function getScreenStyles(profile: Profile): string {
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

function getExportStyles(profile: Profile): string {
  const primary = profile.invoicePrimaryColor || '#1e3a8a';
  const accent = profile.invoiceAccentColor || '#10b981';
  const isClassic = profile.invoiceTemplate === 'classic';
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: ${INVOICE_EXPORT_WIDTH_PX}px;
      margin: 0;
      padding: 0;
      background: #ffffff;
      overflow: visible;
    }
    body {
      font-family: 'IRANYekanX', Tahoma, 'Segoe UI', Arial, sans-serif;
      color: #111827;
      direction: rtl;
      font-size: 14px;
      line-height: 1.65;
      padding: 44px 48px;
    }
    .page {
      width: 100%;
      min-height: ${INVOICE_EXPORT_MIN_HEIGHT_PX - 88}px;
    }
    .layout-table { width: 100%; border-collapse: collapse; border: none; }
    .layout-table td { border: none; vertical-align: top; padding: 0; }
    .header-rule {
      border-bottom: ${isClassic ? '3px' : '2px'} solid ${primary};
      padding-bottom: 22px;
      margin-bottom: 24px;
    }
    .brand h1 {
      color: ${primary};
      font-size: 24px;
      font-weight: 700;
      line-height: 1.45;
      margin-bottom: 10px;
      text-align: right;
    }
    .brand p { color: #6b7280; font-size: 13px; margin: 4px 0; text-align: right; line-height: 1.6; }
    .logo { width: 80px; height: 80px; object-fit: contain; border-radius: 10px; display: block; }
    .badge {
      background: ${primary};
      color: #fff;
      padding: 12px 20px;
      border-radius: ${isClassic ? '4px' : '18px'};
      font-weight: 700;
      font-size: 14px;
      text-align: center;
      white-space: nowrap;
      display: inline-block;
    }
    .meta-table { width: 100%; border-collapse: separate; border-spacing: 14px 0; margin: 0 -14px 24px; }
    .meta-table td { width: 50%; vertical-align: top; }
    .meta-box {
      background: #f8fafc;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 16px 18px;
      height: 100%;
    }
    .meta-box h3 { color: ${primary}; font-size: 13px; font-weight: 700; margin-bottom: 10px; text-align: right; }
    .meta-box p { font-size: 13px; color: #374151; margin: 5px 0; text-align: right; line-height: 1.55; }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      margin: 8px 0 20px;
    }
    .items-table th {
      background: ${primary};
      color: #fff;
      padding: 12px 10px;
      font-size: 13px;
      font-weight: 600;
      text-align: center;
    }
    .items-table td {
      padding: 12px 10px;
      text-align: center;
      border-bottom: 1px solid #e5e7eb;
      font-size: 13px;
      line-height: 1.5;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    .items-table tr:nth-child(even) td { background: #f9fafb; }
    .col-desc { text-align: right !important; padding-right: 14px !important; }
    .totals-table { width: 300px; margin-top: 8px; margin-right: 0; margin-left: auto; border-collapse: collapse; }
    .totals-table td { padding: 8px 0; font-size: 14px; border-bottom: 1px solid #f3f4f6; }
    .totals-table .label { color: #6b7280; text-align: right; padding-left: 24px; }
    .totals-table .value { text-align: left; font-weight: 500; white-space: nowrap; }
    .totals-table .grand td {
      font-size: 17px;
      font-weight: 700;
      color: ${primary};
      border-top: 2px solid ${primary};
      border-bottom: none;
      padding-top: 12px;
    }
    .payment-box {
      background: ${accent}18;
      border: 1px solid ${accent}55;
      border-radius: 10px;
      padding: 16px;
      margin-top: 22px;
      font-size: 14px;
      text-align: right;
    }
    .footer-note { margin-top: 28px; text-align: center; color: #6b7280; font-size: 12px; line-height: 1.6; }
    .sig-table { width: 100%; margin-top: 52px; border-collapse: collapse; }
    .sig-table td { width: 50%; text-align: center; border-top: 1px solid #9ca3af; padding-top: 10px; font-size: 12px; color: #6b7280; }
  `;
}

function buildExportBody(data: InvoiceRenderData): string {
  const { invoice, items, client, profile, project } = data;
  const currency = profile.currency;
  const paidPercent = project && project.totalAmount > 0
    ? Math.round((project.receivedAmount / project.totalAmount) * 100)
    : 0;

  const logoOrBadge = profile.logo
    ? `<img class="logo" src="${profile.logo}" alt="" />`
    : `<span class="badge">فاکتور رسمی</span>`;

  const itemsHtml = items.map((item, i) => `
    <tr>
      <td style="width:44px">${formatPersianNumber(i + 1)}</td>
      <td class="col-desc">${item.title}</td>
      <td style="width:64px">${formatPersianNumber(item.quantity)}</td>
      <td style="width:110px">${formatCurrency(item.unitPrice, currency)}</td>
      <td style="width:110px">${formatCurrency(item.total, currency)}</td>
    </tr>
  `).join('');

  const signatures = profile.invoiceShowSignatures ? `
    <table class="sig-table"><tr>
      <td>امضای مشتری</td>
      <td style="padding-right:40px">مهر و امضای فروشنده</td>
    </tr></table>
  ` : '';

  return `
  <div class="page">
    <div class="header-rule">
      <table class="layout-table"><tr>
        <td style="text-align:right">
          <div class="brand">
            <h1>${profile.fullName || 'فریلنسر'}</h1>
            ${profile.phone ? `<p>تلفن: ${profile.phone}</p>` : ''}
            ${profile.email ? `<p>ایمیل: ${profile.email}</p>` : ''}
            ${profile.address ? `<p>${profile.address}</p>` : ''}
            ${profile.website ? `<p>${profile.website}</p>` : ''}
          </div>
        </td>
        <td style="width:96px;text-align:left">${logoOrBadge}</td>
      </tr></table>
    </div>

    <table class="meta-table"><tr>
      <td>
        <div class="meta-box">
          <h3>اطلاعات فاکتور</h3>
          <p><strong>شماره:</strong> ${invoice.invoiceNumber}</p>
          <p><strong>تاریخ صدور:</strong> ${formatJalaliDate(invoice.issueDate)}</p>
          <p><strong>سررسید:</strong> ${formatJalaliDate(invoice.dueDate)}</p>
        </div>
      </td>
      <td>
        <div class="meta-box">
          <h3>خریدار</h3>
          <p><strong>${client.fullName}</strong></p>
          ${client.companyName ? `<p>${client.companyName}</p>` : ''}
          ${client.phone ? `<p>${client.phone}</p>` : ''}
          ${client.email ? `<p>${client.email}</p>` : ''}
        </div>
      </td>
    </tr></table>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width:44px">ردیف</th>
          <th>شرح خدمات / کالا</th>
          <th style="width:64px">تعداد</th>
          <th style="width:110px">قیمت واحد</th>
          <th style="width:110px">مبلغ</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <table class="totals-table">
      <tr><td class="label">جمع کل</td><td class="value">${formatCurrency(invoice.subtotal, currency)}</td></tr>
      ${invoice.discount > 0 ? `<tr><td class="label">تخفیف</td><td class="value">${formatCurrency(invoice.discount, currency)}</td></tr>` : ''}
      <tr><td class="label">مالیات</td><td class="value">${formatCurrency(invoice.tax, currency)}</td></tr>
      <tr class="grand"><td class="label">قابل پرداخت</td><td class="value">${formatCurrency(invoice.total, currency)}</td></tr>
    </table>

    ${project ? `
    <div class="payment-box">
      پرداخت شده: ${formatPersianNumber(paidPercent)}٪ — مانده: ${formatCurrency(project.remainingAmount, currency)}
    </div>
    ` : ''}

    ${profile.invoiceFooterText ? `<div class="footer-note">${profile.invoiceFooterText}</div>` : ''}
    ${signatures}
  </div>`;
}

function buildScreenBody(data: InvoiceRenderData, forExport?: boolean): string {
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

  return `
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
        ${profile.logo
          ? `<img class="logo" src="${profile.logo}"${forExport ? '' : ' crossorigin="anonymous"'} />`
          : `<div class="badge">فاکتور رسمی</div>`}
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
  </div>`;
}

export function buildInvoiceHtml(
  data: InvoiceRenderData,
  options?: { skipExternalFonts?: boolean; forExport?: boolean; embeddedFontCss?: string },
): string {
  const forExport = options?.forExport === true;
  const styles = forExport ? getExportStyles(data.profile) : getScreenStyles(data.profile);
  const body = forExport ? buildExportBody(data) : buildScreenBody(data, forExport);
  const fontCss = options?.embeddedFontCss ?? '';

  return `<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=${INVOICE_EXPORT_WIDTH_PX}">
  <style>${fontCss}${styles}</style>
</head>
<body>${body}</body>
</html>`;
}
