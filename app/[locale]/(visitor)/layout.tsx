// app/[locale]/(visitor)/layout.tsx (النسخة النهائية الصحيحة)
import React from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default function VisitorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // ✅ الإصلاح: استخدمنا <React.Fragment> (أو <>) بدلاً من div
    // هذا يمنع إضافة طبقة div غير ضرورية قد تكسر التخطيط.
    <>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
