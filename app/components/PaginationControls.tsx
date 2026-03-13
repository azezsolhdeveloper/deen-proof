// app/components/PaginationControls.tsx (النسخة النهائية المصححة لاتجاه الأسهم)

'use client';

import { Link } from '@/i18n/routing';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useTranslations, useLocale } from 'next-intl'; // ✅ 1. استيراد useLocale

type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
  basePath: string;
};

export default function PaginationControls({ currentPage, totalPages, basePath }: PaginationControlsProps) {
  const t = useTranslations('Pagination');
  const locale = useLocale(); // ✅ 2. الحصول على اللغة الحالية
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  if (totalPages <= 1) return null;

  // --- ✅✅✅ 3. بداية الإصلاح الحقيقي والنهائي ✅✅✅ ---
  return (
    <div className="flex justify-center items-center gap-4">
      {/* --- زر "السابق" --- */}
      <Link
        href={`${basePath}?page=${currentPage - 1}`}
        // نستخدم flex-row-reverse في اللغة العربية لعكس ترتيب الأيقونة والنص
        className={`flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 transition-colors hover:bg-slate-50 ${locale === 'ar' ? 'flex-row-reverse' : ''} ${!hasPreviousPage ? 'pointer-events-none opacity-50' : ''}`}
      >
        {/* السهم دائمًا يشير إلى "الوراء" منطقيًا (يسار في LTR، يمين في RTL) */}
        {locale === 'ar' ? <FaArrowRight /> : <FaArrowLeft />}
        <span>{t('previous')}</span>
      </Link>

      {/* --- نص الصفحة --- */}
      <span className="font-bold text-slate-600">
        {t('page')} {currentPage} {t('of')} {totalPages}
      </span>

      {/* --- زر "التالي" --- */}
      <Link
        href={`${basePath}?page=${currentPage + 1}`}
        // نستخدم flex-row-reverse في اللغة العربية لعكس ترتيب الأيقونة والنص
        className={`flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 transition-colors hover:bg-slate-50 ${locale === 'ar' ? 'flex-row-reverse' : ''} ${!hasNextPage ? 'pointer-events-none opacity-50' : ''}`}
      >
        {/* السهم دائمًا يشير إلى "الأمام" منطقيًا (يمين في LTR، يسار في RTL) */}
        {locale === 'ar' ? <FaArrowLeft /> : <FaArrowRight />}
        <span>{t('next')}</span>
      </Link>
    </div>
  );
  // --- نهاية الإصلاح ---
}
