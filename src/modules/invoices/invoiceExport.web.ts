import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import type { InvoiceRenderData } from './invoiceTemplate';
import { buildInvoiceHtml, INVOICE_EXPORT_MIN_HEIGHT_PX, INVOICE_EXPORT_WIDTH_PX } from './invoiceTemplate';
import { getInvoiceExportFontCss, waitForExportFonts } from './invoiceExportFont';

async function uriToDataUrl(uri: string): Promise<string | undefined> {
  if (uri.startsWith('data:')) return uri;
  try {
    const res = await fetch(uri);
    if (!res.ok) return undefined;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return undefined;
  }
}

async function prepareExportData(data: InvoiceRenderData): Promise<InvoiceRenderData> {
  if (!data.profile.logo) return data;
  const logoDataUrl = await uriToDataUrl(data.profile.logo);
  if (!logoDataUrl) {
    return { ...data, profile: { ...data.profile, logo: '' } };
  }
  return { ...data, profile: { ...data.profile, logo: logoDataUrl } };
}

async function waitForImages(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll('img'));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }),
    ),
  );
}

async function renderInvoiceToPngDataUrl(data: InvoiceRenderData): Promise<{
  dataUrl: string;
  width: number;
  height: number;
}> {
  const exportData = await prepareExportData(data);
  const embeddedFontCss = await getInvoiceExportFontCss();
  const html = buildInvoiceHtml(exportData, { forExport: true, embeddedFontCss });

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-20000px';
  iframe.style.top = '0';
  iframe.style.width = `${INVOICE_EXPORT_WIDTH_PX}px`;
  iframe.style.height = `${INVOICE_EXPORT_MIN_HEIGHT_PX}px`;
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    throw new Error('خطا در آماده‌سازی سند');
  }

  doc.open();
  doc.write(html);
  doc.close();

  await waitForExportFonts(doc);
  await waitForImages(doc.body);

  const body = doc.body;
  const contentHeight = Math.max(body.scrollHeight, body.offsetHeight, INVOICE_EXPORT_MIN_HEIGHT_PX);
  iframe.style.height = `${contentHeight}px`;

  const captureWidth = INVOICE_EXPORT_WIDTH_PX;
  const captureHeight = Math.max(body.scrollHeight, INVOICE_EXPORT_MIN_HEIGHT_PX);

  try {
    const dataUrl = await toPng(body, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      skipFonts: false,
      width: captureWidth,
      height: captureHeight,
      style: {
        width: `${captureWidth}px`,
        height: `${captureHeight}px`,
        transform: 'none',
      },
    });
    return { dataUrl, width: captureWidth, height: captureHeight };
  } finally {
    document.body.removeChild(iframe);
  }
}

export async function generateInvoicePdf(data: InvoiceRenderData): Promise<string> {
  const { dataUrl, width, height } = await renderInvoiceToPngDataUrl(data);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  const imgRatio = height / width;
  let renderW = pageW;
  let renderH = pageW * imgRatio;

  if (renderH > pageH) {
    const scale = pageH / renderH;
    renderW *= scale;
    renderH = pageH;
  }

  const offsetX = (pageW - renderW) / 2;
  pdf.addImage(dataUrl, 'PNG', offsetX, 0, renderW, renderH, undefined, 'FAST');
  const blob = pdf.output('blob');
  return URL.createObjectURL(blob);
}

export async function shareInvoiceFile(uri: string, mimeType: string, title: string): Promise<void> {
  const ext = mimeType.includes('pdf') ? '.pdf' : '.png';
  const filename = title.replace(/\s/g, '-') + ext;

  if (uri.startsWith('data:')) {
    const link = document.createElement('a');
    link.href = uri;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  const link = document.createElement('a');
  link.href = uri;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (uri.startsWith('blob:')) {
    setTimeout(() => URL.revokeObjectURL(uri), 5000);
  }
}

export async function generateInvoicePng(
  data: InvoiceRenderData,
  _captureView?: () => Promise<string | undefined>,
): Promise<string> {
  const { dataUrl } = await renderInvoiceToPngDataUrl(data);
  return dataUrl;
}
