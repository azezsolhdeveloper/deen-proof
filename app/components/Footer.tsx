// app/components/Footer.tsx (النسخة النهائية بالألوان الموحدة)

'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="relative mt-auto py-12 border-t border-slate-100 bg-white/50 select-none">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center gap-6 text-center">

          {/* --- ✅ 1. تحديث لون الشعار --- */}
          <div className="flex items-center gap-2 text-xl font-[1000] text-blue-900/80 tracking-tighter">
            <span className="w-2 h-2 bg-blue-700 rounded-full" />
            DeenProof
          </div>

          {/* --- ✅ 2. تحديث لون الوصف --- */}
          <p className="max-w-md text-blue-900/70 font-medium leading-relaxed">
            {t('description')}
          </p>

          {/* --- ✅ 3. تحديث لون الروابط --- */}
          <div className="flex gap-8 text-sm font-bold text-blue-900/50">
            <Link href="/about" className="hover:text-blue-700 transition-colors">
              {t('about')}
            </Link>
            <Link href="/policy" className="hover:text-blue-700 transition-colors">
              {t('policy')}
            </Link>
            <Link href="/contact" className="hover:text-blue-700 transition-colors">
              {t('contact')}
            </Link>
          </div>

          {/* --- ✅ 4. تحديث لون حقوق النشر --- */}
          <div className="mt-4 pt-8 border-t border-slate-50 w-full flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-blue-900/30 uppercase tracking-widest">
            <p>
  &copy; {new Date().getFullYear()} DeenProof
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
