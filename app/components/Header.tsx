// app/components/Header.tsx (النسخة الجديدة الاحترافية)
'use client';

import { Link, usePathname } from '@/i18n/routing'; 
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';

export default function Header() {
  const pathname = usePathname();
  const locale = useLocale();

  // تحديد اللغة القادمة
  const newLocale = locale === 'ar' ? 'en' : 'ar';

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      // تم تعديل الكلاس هنا ليأخذ الارتفاع في الحسبان
      className="fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-300 select-none"
    >
      {/* طبقة الزجاج الشفافة */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-md border-b border-slate-100/50" />

      <nav className="relative container mx-auto px-6 h-full flex justify-between items-center">
        
        {/* شعار الموقع */}
       <div className="flex items-center gap-2">
      {/* --- ✅✅✅ بداية الإصلاح الحقيقي والنهائي (تطبيق رؤيتك على الكود الأصلي) ✅✅✅ --- */}
      <Link 
        href="/" 
        // 1. أزلنا لون النص من هنا لكي لا يؤثر على الألوان الداخلية
        className="flex items-center gap-2.5 text-2xl font-[1000] tracking-tighter"
      >
        {/* 2. النقطة تبقى كما هي */}
        <span className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
        
        {/* 3. كلمة "DeenProof" هي التي تأخذ لون العلامة التجارية */}
        <span className="text-blue-900">DeenProof</span>
      </Link>
      {/* --- نهاية الإصلاح --- */}
    </div>
        {/* زر تغيير اللغة المصحح */}
        <div className="flex items-center">
          <Link 
            href={pathname} // نرسل المسار الحالي فقط
            locale={newLocale} // نمرر اللغة الجديدة كـ prop
            className="group flex items-center gap-2 px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-white hover:border-blue-400 hover:text-blue-600 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 active:scale-95"
          >
            <svg 
              className="w-4 h-4 transition-transform group-hover:rotate-12" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 11.39 8.07 16.5 3 18" />
            </svg>
            {locale === 'ar' ? 'English' : 'العربية'}
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
