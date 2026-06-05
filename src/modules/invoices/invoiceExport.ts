import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { InvoiceRenderData } from './invoiceTemplate';
import { buildInvoiceHtml } from './invoiceTemplate';

async function renderInvoiceToPngDataUrl(data: InvoiceRenderData): Promise<string> {
  const html = buildInvoiceHtml(data, { skipExternalFonts: true });
  const { toPng } = await import('html-to-image');
  const container = document.createElement('div');
  container.innerHTML = html;
  container.style.position = 'fixed';
  container.style.left = '-10000px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.background = '#fff';
  document.body.appendChild(container);
  const target = container.querySelector('.page') as HTMLElement ?? container;

  try {
    return await toPng(target, { cacheBust: true, pixelRatio: 2, backgroundColor: '#ffffff' });
  } finally {
    document.body.removeChild(container);
  }
}

async function generatePdfWeb(data: InvoiceRenderData): Promise<string> {
  const dataUrl = await renderInvoiceToPngDataUrl(data);
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  pdf.addImage(dataUrl, 'PNG', 0, 0, pageW, pageH);
  const blob = pdf.output('blob');
  return URL.createObjectURL(blob);
}

export async function generateInvoicePdf(data: InvoiceRenderData): Promise<string> {
  if (Platform.OS === 'web') {
    return generatePdfWeb(data);
  }

  const html = buildInvoiceHtml(data);
  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
    width: 595,
    height: 842,
  });
  return uri;
}

export async function shareInvoiceFile(uri: string, mimeType: string, title: string): Promise<void> {
  if (Platform.OS === 'web') {
    const link = document.createElement('a');
    link.href = uri;
    link.download = title.replace(/\s/g, '-') + (mimeType.includes('pdf') ? '.pdf' : '.png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (uri.startsWith('blob:')) {
      setTimeout(() => URL.revokeObjectURL(uri), 5000);
    }
    return;
  }
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType, dialogTitle: title, UTI: mimeType });
  }
}

export async function generateInvoicePng(
  data: InvoiceRenderData,
  captureView?: () => Promise<string | undefined>,
): Promise<string> {
  if (Platform.OS === 'web') {
    return renderInvoiceToPngDataUrl(data);
  }

  if (captureView) {
    const uri = await captureView();
    if (uri) return uri;
  }

  throw new Error('خطا در تولید تصویر');
}
