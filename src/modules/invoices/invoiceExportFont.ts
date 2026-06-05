import { Platform } from 'react-native';

const IRANYEKAN_TTF = require('../../../assets/fonts/IRANYekanXVFaNumVF.ttf') as string | number;

let cachedFontCss: string | null = null;

async function resolveFontUri(): Promise<string> {
  if (typeof IRANYEKAN_TTF === 'string') return IRANYEKAN_TTF;

  const { Asset } = require('expo-asset') as {
    Asset: { fromModule: (id: number) => { downloadAsync: () => Promise<void>; localUri?: string | null; uri: string } };
  };
  const asset = Asset.fromModule(IRANYEKAN_TTF);
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  if (!uri) throw new Error('فونت یافت نشد');
  return uri;
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function readAsBase64(uri: string): Promise<string> {
  if (Platform.OS === 'web') {
    const res = await fetch(uri);
    if (!res.ok) throw new Error('خطا در بارگذاری فونت');
    return bufferToBase64(await res.arrayBuffer());
  }

  const FileSystem = await import('expo-file-system/legacy');
  return FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
}

export async function getInvoiceExportFontCss(): Promise<string> {
  if (cachedFontCss) return cachedFontCss;

  const uri = await resolveFontUri();
  const base64 = await readAsBase64(uri);

  cachedFontCss = `
@font-face {
  font-family: 'IRANYekanX';
  src: url('data:font/ttf;base64,${base64}') format('truetype');
  font-weight: 100 900;
  font-style: normal;
  font-display: block;
}
`;

  return cachedFontCss;
}

export async function waitForExportFonts(doc: Document): Promise<void> {
  try {
    if (doc.fonts?.load) {
      await doc.fonts.load("400 16px 'IRANYekanX'");
      await doc.fonts.load("700 24px 'IRANYekanX'");
    }
    await doc.fonts?.ready;
  } catch {
    await new Promise((r) => setTimeout(r, 400));
  }
}
