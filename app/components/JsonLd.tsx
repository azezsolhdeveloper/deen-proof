// app/components/JsonLd.tsx

import { PublicDoubtDetail } from '../services/types';

type JsonLdProps = {
  doubt: PublicDoubtDetail;
  locale: string;
};

export default function JsonLd({ doubt, locale }: JsonLdProps) {
  const title = locale === 'ar' ? doubt.titleAr : (doubt.titleEn || doubt.titleAr);
  const summary = locale === 'ar' ? doubt.summaryAr : (doubt.summaryEn || doubt.summaryAr);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.your-domain.com/${locale}/doubts/${doubt.category}/${doubt.slug}`, // ‼️ سنحتاج إلى استبدال هذا لاحقًا ‼️
    },
    headline: title,
    description: summary,
    author: {
      '@type': 'Person',
      name: doubt.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'DeenProof',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.your-domain.com/logo.png', // ‼️ سنحتاج إلى استبدال هذا لاحقًا ‼️
      },
    },
    datePublished: doubt.publishedAt,
    // إذا كان لديك تاريخ تعديل، يمكنك إضافته هنا
    // dateModified: doubt.updatedAt, 
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData ) }}
    />
  );
}
