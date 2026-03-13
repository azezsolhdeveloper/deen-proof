'use client';

import React from 'react';
import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
import { AuthProvider } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';

export function Providers({ children, messages, locale, timeZone }: { 
  children: React.ReactNode, 
  messages: AbstractIntlMessages, 
  locale: string,
  timeZone: string
}) {
  return (
    // الترتيب الصحيح: next-intl أولاً، ثم AuthProvider
    <NextIntlClientProvider 
      locale={locale} 
      messages={messages} 
      timeZone={timeZone}
    >
      <AuthProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
