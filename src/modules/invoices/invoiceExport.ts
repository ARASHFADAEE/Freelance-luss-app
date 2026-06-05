import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { InvoiceRenderData } from './invoiceTemplate';
import { buildInvoiceHtml } from './invoiceTemplate';
import { getInvoiceExportFontCss } from './invoiceExportFont';

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

export async function generateInvoicePdf(data: InvoiceRenderData): Promise<string> {
  const exportData = await prepareExportData(data);
  const embeddedFontCss = await getInvoiceExportFontCss();
  const html = buildInvoiceHtml(exportData, { embeddedFontCss });
  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
    width: 595,
    height: 842,
  });
  return uri;
}

export async function shareInvoiceFile(uri: string, mimeType: string, title: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType, dialogTitle: title, UTI: mimeType });
  }
}

export async function generateInvoicePng(
  data: InvoiceRenderData,
  captureView?: () => Promise<string | undefined>,
): Promise<string> {
  if (captureView) {
    const uri = await captureView();
    if (uri) return uri;
  }

  throw new Error('خطا در تولید تصویر');
}
