// app/[locale]/dashboard/search/page.tsx

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { searchAllDoubts, getUsers } from '../../../services/api';
import { User } from '../../../services/types';
import { useAuth } from '../../../context/AuthContext';
import { useDebounce } from 'use-debounce';
import { FaSearch, FaFilter, FaTimes, FaSpinner, FaArchive } from 'react-icons/fa';
import RouteGuard from '../../../components/RouteGuard';

// واجهة لنوع بيانات النتائج
interface SearchResult {
  id: number;
  titleAr: string;
  titleEn: string;
  status: string;
  authorName: string;
  updatedAt: string;
}

// مكون لعرض حالة التحميل (Skeleton)
const ResultsSkeleton = () => (
  <div className="mt-8 space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="p-4 bg-gray-100 rounded-lg animate-pulse">
        <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    ))}
  </div>
);

// مكون لعرض بطاقة الحالة (Status Badge)
// --- ✅ الكود الجديد والمطور لـ StatusBadge ---
const StatusBadge = ({ status }: { status: string }) => {
  const t = useTranslations('SearchPage'); // نستخدم نفس مساحة الاسم لتجنب الأخطاء
  const styles: { [key: string]: string } = {
    Published: 'bg-green-100 text-green-800',
    Draft: 'bg-gray-100 text-gray-800',
    NeedsRevision: 'bg-red-100 text-red-800',
    PendingReview: 'bg-yellow-100 text-yellow-800',
    PendingApproval: 'bg-blue-100 text-blue-800',
  };
  
  // مفتاح آمن للترجمة
  const translationKey = status as 'Published' | 'Draft' | 'NeedsRevision' | 'PendingReview' | 'PendingApproval';

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${styles[status] || styles.Draft}`}>
      {t(translationKey)}
    </span>
  );
};


export default function ComprehensiveSearchPage() {
  const t = useTranslations('SearchPage');
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuth();

  // حالات للبحث والفلاتر
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  
  // حالات للبيانات والتحميل
  const [results, setResults] = useState<SearchResult[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // استخدام useDebounce لتأخير البحث وتحسين الأداء
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  // جلب قائمة المستخدمين لملء فلتر المؤلف
  useEffect(() => {
    getUsers().then(setUsers).catch(console.error);
  }, []);

  // التأثير الرئيسي لجلب البيانات عند تغيير الفلاتر
  useEffect(() => {
    // لا تبدأ البحث إلا إذا كان هناك مصطلح بحث أو فلتر مفعل
    if (!debouncedSearchTerm && !statusFilter && !authorFilter) {
      setResults([]);
      return;
    }

    const handleSearch = async () => {
      setIsLoading(true);
      try {
        const data = await searchAllDoubts({
          searchTerm: debouncedSearchTerm,
          status: statusFilter,
          authorId: authorFilter ? parseInt(authorFilter) : undefined,
        });
        setResults(data);
      } catch (error) {
        console.error("Search failed:", error);
        // يمكنك إضافة إشعار خطأ هنا
      } finally {
        setIsLoading(false);
      }
    };

    handleSearch();
  }, [debouncedSearchTerm, statusFilter, authorFilter]);

  const statuses = useMemo(() => ['Published', 'Draft', 'NeedsRevision', 'PendingReview', 'PendingApproval'], []);

  return (
    <RouteGuard allowedRoles={['Admin', 'SuperAdmin', 'Reviewer']}>
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-500" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        
        <header className="mb-10 text-center">
          <FaArchive className="mx-auto text-4xl text-blue-600 mb-4" />
          <h1 className="text-4xl font-black text-gray-900">{t('pageTitle')}</h1>
          <p className="mt-2 text-lg text-gray-600">{t('pageSubtitle')}</p>
        </header>

        <div className="space-y-4">
          {/* شريط البحث الرئيسي */}
          <div className="relative">
            <div className={`absolute inset-y-0 flex items-center pointer-events-none ${locale === 'ar' ? 'right-4' : 'left-4'}`}>
              {isLoading ? <FaSpinner className="animate-spin text-gray-400" /> : <FaSearch className="text-gray-400" />}
            </div>
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full p-4 border-2 border-gray-200 rounded-xl text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${locale === 'ar' ? 'pr-12' : 'pl-12'}`}
            />
          </div>

          {/* منطقة الفلاتر */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
             <select
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
  className="w-full p-3 bg-white border border-gray-300 rounded-lg appearance-none font-medium"
>
  <option value="">{t('allStatuses')}</option>
  {/* --- ✅✅✅ هذا هو الإصلاح النهائي ✅✅✅ --- */}
  {statuses.map(status => (
    <option key={status} value={status}>
      {t(status as 'Published' | 'Draft' | 'NeedsRevision' | 'PendingReview' | 'PendingApproval')}
    </option>
  ))}
</select>

              <FaFilter className="absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none right-4" />
            </div>
            <div className="relative">
              <select
                value={authorFilter}
                onChange={(e) => setAuthorFilter(e.target.value)}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg appearance-none font-medium"
              >
                <option value="">{t('allAuthors')}</option>
                {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
              </select>
              <FaFilter className="absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none right-4" />
            </div>
          </div>
        </div>

        {/* منطقة عرض النتائج */}
        <div className="mt-10">
          {isLoading ? (
            <ResultsSkeleton />
          ) : results.length > 0 ? (
            <div className="space-y-3">
              {results.map(doubt => (
                <div 
                  key={doubt.id}
                  onClick={() => router.push(`/dashboard/doubts/edit/${doubt.id}`)}
                  className="p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-grow">
                      <h3 className="font-bold text-gray-800">{locale === 'ar' ? doubt.titleAr : (doubt.titleEn || doubt.titleAr)}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {t('author')}: {doubt.authorName} • {t('lastUpdated')}: {new Date(doubt.updatedAt).toLocaleDateString(locale)}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <StatusBadge status={doubt.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <p className="text-gray-500 font-medium">
                {(!debouncedSearchTerm && !statusFilter && !authorFilter) ? t('startTyping') : t('noResults')}
              </p>
            </div>
          )}
        </div>
      </div>
    </RouteGuard>
  );
}
