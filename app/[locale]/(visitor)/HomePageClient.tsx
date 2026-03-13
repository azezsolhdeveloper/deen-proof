// app/[locale]/(visitor)/HomePageClient.tsx (النسخة الكاملة والمصححة)

'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import InteractiveSearch from '@/app/components/InteractiveSearch';
import MotionContainer from '@/app/components/MotionContainer';
import MotionItem from '@/app/components/MotionItem';

export default function HomePageClient({ statsMap }: { statsMap: Map<string, number> }) {
  const t = useTranslations('HomePage');
  const locale = useLocale();

  const categories = [
    { id: 'quran', icon: "📖", color: "from-blue-600/20 to-indigo-600/20", border: "border-blue-200/50", text: "text-blue-700", size: "md:col-span-2" },
    { id: 'prophet', icon: "🕌", color: "from-emerald-600/20 to-teal-600/20", border: "border-emerald-200/50", text: "text-emerald-700", size: "md:col-span-1" },
    { id: 'science', icon: "🔬", color: "from-purple-600/20 to-fuchsia-600/20", border: "border-purple-200/50", text: "text-purple-700", size: "md:col-span-1" },
    { id: 'history', icon: "📜", color: "from-orange-600/20 to-red-600/20", border: "border-orange-200/50", text: "text-orange-700", size: "md:col-span-2" },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white select-none">
      <div className="relative z-10 container mx-auto px-6 py-20">
        
        <section className="mb-24 pt-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            className="relative max-w-4xl mx-auto text-center bg-gradient-to-br from-blue-600/10 to-indigo-600/10 backdrop-blur-sm rounded-[4rem] p-8 md:p-16 border border-blue-200/30 shadow-xl shadow-blue-900/5"
          >
            <div className="relative z-10">
<h1 className="text-4xl md:text-8xl font-black text-blue-900/90 mb-6 leading-tight tracking-tighter">
                {t('title')}
              </h1>
              <p className="text-xl md:text-2xl text-blue-900/60 max-w-3xl mx-auto font-medium leading-relaxed mb-12">
                {t('subtitle')}
              </p>
              <InteractiveSearch />
            </div>
          </motion.div>
        </section>

        <MotionItem className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-blue-900/90">
            {t('browseByTopic')}
          </h2>
        </MotionItem>

        {/* --- ✅✅✅ بداية الإصلاح الحقيقي والنهائي ✅✅✅ --- */}
        <MotionContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {categories.map((cat) => (
            // الآن، `MotionItem` هو العنصر الذي يتم تكراره مباشرة داخل `map`
            // وهو أيضًا الابن المباشر لـ `MotionContainer`
            <MotionItem key={cat.id} className={cat.size}>
              <Link href={`/doubts/${cat.id}`} className="group relative block h-full">
                <div className={`h-full relative overflow-hidden bg-gradient-to-br ${cat.color} backdrop-blur-md rounded-[3rem] p-10 border ${cat.border} transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl`}>
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start">
                      <div className="text-5xl mb-6 transform group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500">
                        {cat.icon}
                      </div>
                      <div className="text-lg font-bold text-slate-700/70 bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full">
                        {statsMap.get(cat.id) || 0} {t('rebuttalCount')}
                      </div>
                    </div>
                    <h3 className={`text-3xl font-black mb-4 ${cat.text}`}>
                      {t(cat.id)}
                    </h3>
                    <p className="text-slate-600 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                      {t('categoryDesc')} {t(cat.id)}.
                    </p>
                    <div className="mt-auto pt-8 flex items-center gap-2 text-blue-900/90 font-bold opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                      <span>{t('discoverMore')}</span>
                      <svg className={`w-5 h-6 transition-transform ${locale === 'ar' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </div>
                  </div>
                </div>
              </Link>
            </MotionItem>
          ))}
        </MotionContainer>
        {/* --- نهاية الإصلاح --- */}
      </div>
    </div>
  );
}
