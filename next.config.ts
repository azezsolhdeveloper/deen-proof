// next.config.mjs (النسخة النهائية مع الإعداد الصحيح)
import createNextIntlPlugin from 'next-intl/plugin';

// هذا السطر يخبر next-intl بمكان ملف التكوين الجديد
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // لا توجد أي إعدادات أخرى هنا
};

export default withNextIntl(nextConfig);
