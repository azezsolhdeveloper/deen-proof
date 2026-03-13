// app/[locale]/(visitor)/[page]/page.tsx (النسخة النهائية المصححة بالكامل)

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';
import { notFound } from 'next/navigation';
import { locales } from '../../../../i18n/routing'; // ✅ 1. استيراد اللغات

// --- ✅✅✅ 2. بداية الإصلاح الحقيقي والنهائي (إضافة generateStaticParams) ✅✅✅ ---
export async function generateStaticParams() {
  const pagesDir = path.join(process.cwd(), 'content', 'pages');
  const filenames = fs.readdirSync(pagesDir);
  
  const paths = [];
  for (const locale of locales) {
    for (const filename of filenames) {
      paths.push({
        locale: locale,
        page: filename.replace('.md', ''),
      });
    }
  }
  return paths;
}
// --- نهاية الإصلاح ---

type PageProps = {
  params: { page: string; locale: string; };
};

function getPageContent(pageSlug: string, locale: string) {
  const filePath = path.join(process.cwd(), 'content', 'pages', `${pageSlug}.md`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);

  const [contentAr, contentEn] = content.split('---');

  return {
    title: locale === 'ar' ? data.titleAr : data.titleEn,
    content: locale === 'ar' ? contentAr : contentEn,
  };
}

export default async function StaticPage({ params }: PageProps) {
  const { page, locale } = await params;
  const pageContent = getPageContent(page, locale);

  if (!pageContent) {
    notFound();
  }

  return (
<div className="relative min-h-screen bg-white overflow-x-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-purple-50 to-pink-100/50 blur-[120px]" />
        <div className="absolute bottom-0 -left-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-blue-50 to-indigo-50/50 blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black text-blue-900 mb-12">{pageContent.title}</h1>
         <div className="prose prose-lg max-w-none text-blue-900 prose-p:text-slate-800 prose-ul:text-slate-800 prose-ol:text-slate-800 prose-a:text-blue-700 hover:prose-a:text-blue-900">
  <ReactMarkdown>{pageContent.content}</ReactMarkdown>
</div>
        </div>
      </div>
    </div>
  );
}
