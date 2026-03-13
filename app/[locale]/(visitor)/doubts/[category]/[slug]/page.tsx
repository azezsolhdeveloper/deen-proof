import { 
  getPublishedDoubtBySlug, 
  getAllPublishedDoubts, // ✅ تأكد من وجود هذه الدالة
  getStaticParamsForDoubts 
} from '../../../../../services/api';
import { notFound } from 'next/navigation';
import { Link, locales } from '../../../../../../i18n/routing';
import { getTranslations } from 'next-intl/server';
import ShareButtons from '@/app/components/ShareButtons';
import ClaimCard from '@/app/components/ClaimCard'; // ✅ استخدام المكون الخاص بك
import { PublicDoubt, PublicDoubtDetail } from '../../../../../services/types';
import JsonLd from '@/app/components/JsonLd'; // ✅ إضافة هذا السطر
import FeedbackSection from '@/app/components/FeedbackSection'; // ✅ إضافة هذا السطر
import DoubtStats from '@/app/components/DoubtStats'; // ✅ استيراد مكون الإحصائيات

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const allParams = await getStaticParamsForDoubts();

    const paths = [];

    for (const locale of locales) {
      for (const params of allParams) {
        paths.push({
          locale: locale,
          category: params.category,
          slug: params.slug,
        });
      }
    }

    return paths;
  } catch (error) {
    console.error("Failed to fetch static params:", error);
    return [];
  }
}

type PageProps = {
  params: Promise<{ slug: string; locale: string; category: string; }>; 
};

export default async function DoubtDetailPage({ params }: PageProps) {
  const { slug, locale } = await params;
  const decodedSlug = decodeURIComponent(slug);
  
  let doubt: PublicDoubtDetail;
  try {
    doubt = await getPublishedDoubtBySlug(decodedSlug);
  } catch (error) {
    notFound();
  }

  if (!doubt) notFound();

  const tDetail = await getTranslations({ locale, namespace: 'DoubtDetailPage' });
  const tCategory = await getTranslations({ locale, namespace: 'CategoryPage' });

  // ✅ استخراج البيانات بناءً على اللغة من النوع PublicDoubtDetail
  const title = locale === 'ar' ? doubt.titleAr : (doubt.titleEn || doubt.titleAr);
  const summary = locale === 'ar' ? doubt.summaryAr : (doubt.summaryEn || doubt.summaryAr);
  const quickReply = locale === 'ar' ? doubt.quickReplyAr : (doubt.quickReplyEn || doubt.quickReplyAr);
  const categoryTitle = tCategory(doubt.category);

  // حساب زمن القراءة
 const contentForReadingTime = [
  quickReply, // المحتوى من الرد السريع
  // المحتوى من كل الردود التفصيلية
  ...doubt.detailedRebuttal.map(r => (locale === 'ar' ? r.responseAr : r.responseEn))
].join(' ').trim(); // .join() لدمج كل النصوص في نص واحد، و .trim() للتنظيف

// 2. حساب عدد الكلمات فقط إذا كان هناك محتوى فعلي
let wordCount = 0;
if (contentForReadingTime) {
  // نقسم النص إلى كلمات عند كل مسافة ونحسب عددها
  wordCount = contentForReadingTime.split(/\s+/).length;
}

// 3. حساب زمن القراءة (عدد الكلمات / متوسط سرعة القراءة) ثم تقريب الناتج لأعلى رقم صحيح
const readingTime = Math.ceil(wordCount / 225) || 1;

  const allDoubts = await getAllPublishedDoubts(); 
const jsonLdComponent = <JsonLd doubt={doubt} locale={locale} />;
// 2. نقوم بالفلترة في الواجهة الأمامية
const relatedDoubts: PublicDoubt[] = allDoubts
  // نختار الشبهات التي من نفس الفئة، وليست الشبهة الحالية
  .filter(d => d.category === doubt.category && d.slug !== decodedSlug)
  // نأخذ أول اثنتين فقط
  .slice(0, 2);

  return (
  <div className="relative min-h-screen bg-white overflow-x-hidden" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {jsonLdComponent}{/* التأثيرات الخلفية الفنية */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-purple-50 to-pink-100/50 blur-[120px]" />
<div className="absolute bottom-0 -left-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-blue-50 to-indigo-50/50 blur-[100px]" />
      </div>

<div className="relative z-10 w-full px-6 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumbs */}
         <div className="mb-8 text-sm font-medium text-blue-900/70">
  <Link href="/" className="hover:text-blue-700">{tDetail('home')}</Link>
  <span className="mx-2">/</span>
  <Link href={`/doubts/${doubt.category}`} className="hover:text-blue-700">{categoryTitle}</Link>
  <span className="mx-2">/</span>
  <span className="font-bold text-blue-900 line-clamp-1">{title}</span>
</div>

          <article>
            <div className="border-b border-slate-200 pb-8 mb-8">
            <h1 className="text-4xl md:text-6xl font-black text-blue-900 mb-4 leading-tight">{title}</h1>
<p className="text-lg text-blue-900/70 mb-6">{summary}</p>
{/* --- ✅✅✅ هذا هو المكان الصحيح لإضافة الإحصائيات --- */}
<DoubtStats 
    viewCount={doubt.viewCount} 
    likeCount={doubt.likeCount} 
    className="mb-6" // نضيف مسافة سفلية
/>
{/* --- نهاية الإضافة --- */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-slate-500">
               <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-slate-600">
  <span>
    {tDetail('authorLabel')}: <span className="font-bold text-slate-800">{doubt.authorName}</span>
  </span>
  
  {doubt.reviewerName && (
    <>
      <span className="text-slate-300">|</span>
      <span>
        {tDetail('reviewerLabel')}: <span className="font-bold text-slate-800">{doubt.reviewerName}</span>
      </span>
    </>
  )}

  <span className="text-slate-300">|</span>
  <span>{tDetail('readingTimeLabel', { time: readingTime })}</span>
</div>
                <ShareButtons title={title} />
              </div>
            </div>

            {/* استخدام النمط المطلوب: group/layout مع التخطيط الشبكي */}
            <div className="group/layout grid grid-cols-1 lg:grid-cols-4 gap-12">
              
              {/* جدول المحتويات الجانبي الثابت */}
              <aside className="lg:col-span-1 lg:sticky top-24 self-start hidden lg:block transition-all duration-300 lg:group-hover/layout:opacity-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
                    {locale === 'ar' ? 'جدول المحتويات' : 'Contents'}
                </h3>
               <ul className="space-y-3">
  {quickReply && <li><a href="#quick-reply" className="font-medium text-slate-500 hover:text-blue-700 transition-colors">{tDetail('quickReplyTitle')}</a></li>}
  {doubt.detailedRebuttal.length > 0 && <li><a href="#detailed-rebuttal" className="font-medium text-slate-500 hover:text-blue-700 transition-colors">{tDetail('detailedResponseTitle')}</a></li>}
  {doubt.mainSources.length > 0 && <li><a href="#sources" className="font-medium text-slate-500 hover:text-blue-700 transition-colors">{tDetail('sourcesTitle')}</a></li>}
</ul>
              </aside>

              <main className="lg:col-span-3 space-y-16">
                {/* قسم الرد السريع */}
                {quickReply && (
                  <section id="quick-reply">
                  <h2 className="text-3xl font-bold text-blue-900 mb-4">{tDetail('quickReplyTitle')}</h2>
<p className="text-lg text-slate-700 leading-relaxed bg-blue-50/50 p-6 rounded-2xl whitespace-pre-wrap">{quickReply}</p>  </section>
                )}
                
           {doubt.detailedRebuttal.map((rebuttalItem, index) => {
  const claimText = locale === 'ar' ? rebuttalItem.claimAr : rebuttalItem.claimEn;
  const responseText = locale === 'ar' ? rebuttalItem.responseAr : rebuttalItem.responseEn;

  return (
   <ClaimCard 
  key={rebuttalItem.id || index} 
  claim={claimText}
  response={responseText}
  sources={rebuttalItem.sources || []}
  claimIndex={index} 
/>

  );
  // --- نهاية الإصلاح ---
})}

                {/* قسم المصادر */}
                {doubt.mainSources.length > 0 && (
                  <section id="sources">
                   <h2 className="text-3xl font-bold text-blue-900 mb-4">{tDetail('sourcesTitle')}</h2>
<ul className="space-y-3 list-none p-0">
{doubt.mainSources.map((source) => {
  // --- بداية الكود المضاف للحماية ---
  let finalUrl = source.url ?? '#'; // إذا كان الرابط فارغًا، استخدم '#' كرابط آمن
  
  // التحقق من أن الرابط ليس فارغًا وأنه لا يبدأ بـ http
  if (finalUrl && finalUrl !== '#' && !finalUrl.startsWith('http' )) {
    finalUrl = `https://` + finalUrl; // أضف https:// إلى البداية
  }
  // --- نهاية الكود المضاف للحماية ---

  return (
    <li key={source.id}>
      <a 
        href={finalUrl} // استخدام الرابط النهائي المحمي
        target="_blank" 
        rel="noopener noreferrer" 
        className="flex items-start bg-blue-50/50 p-4 rounded-xl group hover:bg-blue-100/60 transition-colors"
      >
        <div className="text-blue-700 mt-1 flex-shrink-0 ltr:mr-3 rtl:ml-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <span className="text-blue-900/80 font-medium group-hover:text-blue-900">{source.name}</span>
      </a>
    </li>
   );
})}

</ul>
                  </section>
                )}
              </main>
            </div>
          </article>
{/* --- ✅✅✅ إضافة قسم الملاحظات هنا --- */}
<div className="mt-16">
  <FeedbackSection doubtId={doubt.id} />
</div>
          {/* شبهات ذات صلة بنفس النمط البصري */}
          {relatedDoubts.length > 0 && (
            <div className="mt-24 pt-12 border-t border-slate-200">
              <h2 className="text-3xl font-bold text-center text-blue-900 mb-8">
    {locale === 'ar' ? 'شبهات ذات صلة' : 'Related Doubts'}
</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedDoubts.map((d) => {
  // --- ✅✅✅ بداية الإصلاح الحقيقي والنهائي ✅✅✅ ---
  // نطبق نفس المنطق الذكي هنا لاختيار اللغة الصحيحة
  const relatedTitle = locale === 'ar' ? d.titleAr : (d.titleEn || d.titleAr);
  const relatedSummary = locale === 'ar' ? d.summaryAr : (d.summaryEn || d.summaryAr);
  // --- نهاية الإصلاح ---

  return (
    <Link key={d.id} href={`/doubts/${d.category}/${d.slug}`} className="block p-6 bg-white/50 backdrop-blur-md rounded-2xl border border-slate-200/50 hover:border-blue-300/50 hover:shadow-lg transition-all">
        <h3 className="font-bold text-blue-900 mb-2">{relatedTitle}</h3>
        <p className="text-sm text-blue-900/70 line-clamp-2">{relatedSummary}</p>
    </Link>
  );
})}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}