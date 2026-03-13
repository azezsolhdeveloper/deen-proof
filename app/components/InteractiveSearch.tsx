// app/components/InteractiveSearch.tsx (النسخة النهائية المطورة)

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash';
import { searchPublicDoubts } from '../services/api';
import HighlightText from './HighlightText'; // ✅ 1. استيراد مكون التمييز
import SearchSkeleton from './SearchSkeleton'; // ✅ 2. استيراد مكون الهيكل العظمي

type SearchResult = {
  slug: string;
  category: string;
  title: string;
  summary: string;
};

// قاموس لترجمة أسماء الفئات
const categoryTranslations: { [key: string]: string } = {
  quran: 'HomePage.quran',
  prophet: 'HomePage.prophet',
  science: 'HomePage.science',
  history: 'HomePage.history',
};

export default function InteractiveSearch() {
  const t = useTranslations(); // نستخدم t بدون namespace للوصول إلى كل الترجمات
  const locale = useLocale();
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const fetchResults = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) { // يمكننا تقليل الحد إلى 2
      setResults([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await searchPublicDoubts(searchQuery, locale);
      setResults(data);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    }
    setIsLoading(false);
  }, [locale]);

  const debouncedFetchResults = useMemo(
    () => debounce(fetchResults, 300),
    [fetchResults]
  );

  useEffect(() => {
    debouncedFetchResults(query);
    return () => {
      debouncedFetchResults.cancel();
    };
  }, [query, debouncedFetchResults]);

  return (
    <div className="relative max-w-2xl mx-auto" onBlur={() => setTimeout(() => setIsFocused(false), 200)}>
      <input
        type="search"
        placeholder={t('HomePage.searchPlaceholder')}
        className="w-full bg-white/50 py-5 px-14 text-xl outline-none text-slate-800 placeholder:text-slate-400 font-medium rounded-2xl border border-white/50 focus:ring-2 focus:ring-white/80 transition-all duration-300"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
      />
      <div className="absolute top-1/2 left-5 -translate-y-1/2 text-blue-800">
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>

      <AnimatePresence>
        {isFocused && query.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute top-full mt-3 w-full bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden z-20"
          >
            {/* --- ✅✅✅ 3. بداية الإصلاح الحقيقي والنهائي ✅✅✅ --- */}
            {isLoading ? (
              <SearchSkeleton /> // استخدام الهيكل العظمي بدلاً من النص
            ) : results.length > 0 ? (
              <ul className="divide-y divide-slate-200/80">
                {results.map((result) => (
                  <li key={result.slug}>
                    <Link href={`/doubts/${result.category}/${result.slug}`} className="block p-4 hover:bg-blue-50/50 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-blue-900">
                          {/* استخدام مكون التمييز للعنوان */}
                          <HighlightText text={result.title} highlight={query} />
                        </h4>
                        {/* إظهار الفئة */}
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full flex-shrink-0 ml-2">
                          {t(categoryTranslations[result.category] || result.category)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {/* استخدام مكون التمييز للملخص */}
                        <HighlightText text={result.summary} highlight={query} />
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center text-slate-500 font-medium">{t('HomePage.noResults')}</div>
            )}
            {/* --- نهاية الإصلاح --- */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
