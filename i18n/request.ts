import {getRequestConfig} from 'next-intl/server';
import { routing } from './routing'; // سنعود إلى استخدام routing

export default getRequestConfig(async ({locale}) => {
  // 1. نستخدم نفس المنطق الذي كان لديك في الأصل لتحديد اللغة النشطة
  // هذا يضمن أن 'activeLocale' ستكون دائمًا 'string'
  const activeLocale = locale ?? routing.defaultLocale;

  return {
    // 2. نستخدم 'activeLocale' المؤكدة هنا
    locale: activeLocale,
    
    // 3. ونستخدمها أيضًا لتحميل الرسائل
    messages: (await import(`../messages/${activeLocale}.json`)).default,
    
    // 4. ونضيف المنطقة الزمنية
    timeZone: 'Asia/Riyadh'
  };
});
