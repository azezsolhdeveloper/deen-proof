// app/[locale]/dashboard/my-library/page.tsx

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '../../../../i18n/routing';
import { getMyLibrary } from '../../../services/api';
import { FaEdit, FaSpinner, FaSearch } from 'react-icons/fa';
import { useDebounce } from 'use-debounce';
import RouteGuard from '../../../components/RouteGuard';

type MyDoubt = {
    id: number;
    titleAr: string;
    titleEn?: string;
    status: string;
    updatedAt: string;
};

// --- ✅✅✅ بداية الإصلاح النهائي ✅✅✅ ---

// 1. إنشاء نوع مخصص لمفاتيح الحالة المحتملة
type StatusTranslationKey = 
    | 'status_Draft'
    | 'status_PendingReview'
    | 'status_NeedsRevision'
    | 'status_Published'
    | 'status_PendingApproval';

const StatusBadge = ({ status }: { status: string }) => {
    const t = useTranslations('EditDoubtPage');
    
    // 2. إنشاء المفتاح الديناميكي
    const statusKey = `status_${status}` as StatusTranslationKey;
    
    const styles: { [key: string]: string } = {
        Draft: 'bg-gray-100 text-gray-700',
        PendingReview: 'bg-yellow-100 text-yellow-700',
        NeedsRevision: 'bg-red-100 text-red-700',
        Published: 'bg-green-100 text-green-700',
        PendingApproval: 'bg-blue-100 text-blue-700',
    };
    
    return (
        // 3. استخدام المفتاح المكتوب بشكل آمن
        <span className={`px-2 py-1 text-xs font-bold rounded-full ${styles[status] || 'bg-gray-200'}`}>
            {t(statusKey)}
        </span>
    );
};

// --- نهاية الإصلاح النهائي ---


export default function MyLibraryPage() {
    const t = useTranslations('MyLibraryPage');
    const locale = useLocale();
    
    const [allDoubts, setAllDoubts] = useState<MyDoubt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

    useEffect(() => {
        getMyLibrary()
            .then(data => {
                setAllDoubts(data);
            })
            .catch(err => console.error("Failed to fetch library:", err))
            .finally(() => setIsLoading(false));
    }, []);

    const filteredDoubts = useMemo(() => {
        if (debouncedSearchTerm) {
            const lowercasedTerm = debouncedSearchTerm.toLowerCase();
            return allDoubts.filter(doubt =>
                doubt.titleAr.toLowerCase().includes(lowercasedTerm) ||
                (doubt.titleEn && doubt.titleEn.toLowerCase().includes(lowercasedTerm))
            );
        }
        return allDoubts;
    }, [debouncedSearchTerm, allDoubts]);

    return (
        <RouteGuard allowedRoles={['Researcher']}>
            <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">{t('pageTitle')}</h1>
                    <p className="mt-2 text-lg text-gray-600">{t('pageSubtitle')}</p>
                </header>

                <div className="relative mb-8">
                    <FaSearch className="absolute top-1/2 -translate-y-1/2 text-gray-400 ltr:left-4 rtl:right-4" />
                    <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-4 ltr:pl-12 rtl:pr-12 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="p-8 text-center"><FaSpinner className="animate-spin mx-auto text-2xl text-gray-400" /></div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr className={locale === 'ar' ? 'text-right' : 'text-left'}>
                                    <th scope="col" className="px-6 py-3">{t('tableHeader_rebuttal')}</th>
                                    <th scope="col" className="px-6 py-3">{t('tableHeader_status')}</th>
                                    <th scope="col" className="px-6 py-3">{t('tableHeader_lastUpdated')}</th>
                                    <th scope="col" className="px-6 py-3"><span className="sr-only">{t('tableHeader_action')}</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDoubts.map(doubt => (
                                    <tr key={doubt.id} className={`border-b hover:bg-gray-50 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {locale === 'ar' ? doubt.titleAr : (doubt.titleEn || doubt.titleAr)}
                                        </td>
                                        <td className="px-6 py-4"><StatusBadge status={doubt.status} /></td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(doubt.updatedAt).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link href={`/dashboard/doubts/edit/${doubt.id}`} className="text-blue-600 hover:underline font-semibold flex items-center gap-1.5">
                                                <FaEdit />
                                                <span>{t('editAction')}</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {filteredDoubts.length === 0 && !isLoading && (
                        <div className="p-16 text-center text-gray-500">
                            <p>{t('noResults')}</p>
                        </div>
                    )}
                </div>
            </div>
        </RouteGuard>
    );
}
