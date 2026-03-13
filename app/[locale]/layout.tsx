// app/layout.tsx (النسخة النهائية المصححة)

import React from 'react';
import { Providers } from '../components/Providers';
import { locales } from '../../i18n/routing';
import { notFound } from 'next/navigation';
import { Cairo } from 'next/font/google';
import type { Metadata } from 'next'; // 1. استيراد النوع Metadata (ممارسة جيدة)

import './globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['500', '700'],
  style: 'normal',
  display: 'swap',
});

// --- ✅✅✅ بداية الإصلاح الحقيقي والنهائي ✅✅✅ ---
// 2. إنشاء وتصدير كائن metadata
export const metadata: Metadata = {
  title: 'DeenProof | برهان الدين',
  description: 'موسوعة شاملة للرد على الشبهات الإسلامية',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
// --- نهاية الإصلاح ---

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>; 
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params; 

  const isValidLocale = locales.some((cur) => cur === locale);
  if (!isValidLocale) {
    notFound();
  }

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  const timeZone = 'Asia/Riyadh';

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body className={cairo.className}>
        <Providers messages={messages} locale={locale} timeZone={timeZone}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
