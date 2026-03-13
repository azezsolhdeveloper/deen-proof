// app/components/DoubtCard.tsx (النسخة النهائية مع نظام الإشعارات)

'use client';

import { useRouter } from '@/i18n/routing';
import { PublicDoubt } from '../services/types';
import { useLocale, useTranslations } from 'next-intl';
// --- ✅ 1. استيراد نظام الإشعارات ---
import { useNotification } from '../context/NotificationContext';

type DoubtCardProps = {
  doubt: PublicDoubt;
};

export default function DoubtCard({ doubt }: DoubtCardProps) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('DoubtCard');
  // --- ✅ 2. تهيئة نظام الإشعارات ---
  const { addNotification } = useNotification();

  const title = locale === 'ar' ? doubt.titleAr : (doubt.titleEn || doubt.titleAr);
  const summary = locale === 'ar' ? doubt.summaryAr : (doubt.summaryEn || doubt.summaryAr);

  const buttonPositionClass = locale === 'ar' ? 'left-0' : 'right-0';
  const titlePaddingClass = locale === 'ar' ? 'pl-12' : 'pr-12';

  const targetHref = `/doubts/${doubt.category}/${doubt.slug}`;

  const handleCardClick = () => {
    router.push(targetHref);
  };

  // --- ✅ 3. تحديث دالة المشاركة لاستخدام الإشعارات ---
  const handleShare = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const url = `${window.location.origin}/${locale}${targetHref}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        addNotification(t('copySuccess'), 'success');
      })
      .catch(() => {
        addNotification(t('copyFail'), 'error');
      });
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group relative cursor-pointer h-full flex flex-col bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-slate-200/50 shadow-lg transition-all duration-300 hover:border-blue-400/50 hover:shadow-xl"
    >
      <div className="relative flex-grow flex flex-col">
        <div className="relative">
          <h2 className={`text-2xl font-bold text-blue-900 leading-snug ${titlePaddingClass}`}>
            {title}
          </h2>
          <button 
            onClick={handleShare}
            className={`absolute top-0 ${buttonPositionClass} w-12 h-12 flex items-center justify-center bg-slate-100/80 rounded-full border border-slate-200/80 text-slate-500 hover:bg-white hover:text-blue-700 transition-all duration-300 active:scale-95`}
            title={t('shareTitle')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>
        </div>
        <p className="text-blue-900/70 leading-relaxed mt-4">
          {summary}
        </p>
      </div>
      <div className="mt-auto pt-6 text-blue-700 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
        {t('readMore')}
      </div>
    </div>
  );
}
