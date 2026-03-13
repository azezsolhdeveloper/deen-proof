// app/sitemap.ts

import { MetadataRoute } from 'next';
import { getAllPublishedDoubtsForSitemap } from 'app/services/api'; 
import { locales } from './i18n/routing';

// ‼️ سنحتاج إلى استبدال هذا لاحقًا ‼️
const BASE_URL = 'https://www.your-domain.com';

export default async function sitemap( ): Promise<MetadataRoute.Sitemap> {
  // 1. إضافة الصفحات الثابتة (الرئيسية، عن الموسوعة، إلخ)
  const staticPages = ['/', '/about', '/policy', '/contact'];
  const staticUrls = staticPages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${page === '/' ? '' : page}`,
      lastModified: new Date(),
    }))
  );

  // 2. إضافة صفحات فئات الشبهات
  const categories = ['quran', 'prophet', 'science', 'history'];
  const categoryUrls = categories.flatMap((category) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/doubts/${category}`,
      lastModified: new Date(),
    }))
  );

  // 3. إضافة صفحات الشبهات الديناميكية من قاعدة البيانات
  const doubts = await getAllPublishedDoubtsForSitemap();
  const doubtUrls = doubts.flatMap((doubt: { slug: string; category: string; publishedAt: string; }) => 

    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/doubts/${doubt.category}/${doubt.slug}`,
      // إذا كان لديك تاريخ تعديل، استخدمه هنا. وإلا، استخدم تاريخ النشر.
      lastModified: doubt.publishedAt ? new Date(doubt.publishedAt) : new Date(),
    }))
  );

  // 4. دمج كل الروابط معًا
  return [...staticUrls, ...categoryUrls, ...doubtUrls];
}
