import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'leaflet/dist/leaflet.css';
import './globals.css';

import type { Metadata, Viewport } from 'next';

import MobileDock from '@/components/MobileDock';
import { I18nProvider } from '@/components/I18nProvider';
import { InstallProvider } from '@/components/pwa/InstallProvider';
import InstallFloatingButton from '@/components/pwa/InstallFloatingButton';
import WhatsAppButton from '@/components/WhatsAppButton';
import { getLocale } from '@/lib/i18n';

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  applicationName: "FarmaGo",
  appleWebApp: {
    capable: true,
    title: "FarmaGo",
    statusBarStyle: "default",
  },
  other: {
    // O Next 16 emite `mobile-web-app-capable`, mas o Safari só reconhece a
    // variante com prefixo `apple-`. O manifesto resolve o iOS 16.4+; esta tag
    // cobre os telemóveis mais antigos, que ainda são muitos por cá.
    "apple-mobile-web-app-capable": "yes",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // O dock e os botões flutuantes já usam env(safe-area-inset-*).
  viewportFit: "cover",
  themeColor: "#0f8a0e",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body>
        <I18nProvider locale={locale}>
          <InstallProvider>
            {children}
            <MobileDock />
            <WhatsAppButton />
            <InstallFloatingButton />
          </InstallProvider>
        </I18nProvider>
      </body>
    </html>
  );
}