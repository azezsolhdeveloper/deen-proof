import { getTranslations } from 'next-intl/server';
import { Link, locales } from '../../../../../i18n/routing';
import { getPaginatedPublishedDoubts } from '../../../../services/api';
import DoubtCard from '@/app/components/DoubtCard';
import { PublicDoubt } from '../../../../services/types';
import PaginationControls from '@/app/components/PaginationControls';

export async function generateStaticParams() {
  const categories = ['quran', 'prophet', 'science', 'history'];
  const paths = [];
  for (const locale of locales) {
    // نستخدم `cat` كاسم للمتغير لتجنب أي التباس
    for (const cat of categories) { 
      // الآن نحن نمرر القيمة الصحيحة من الحلقة
      paths.push({ locale: locale, category: cat }); 
    }
  }
  return paths;
}

type PageProps = {
  params: { category: string; locale: string; };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { category, locale } = await params;
  const tCategory = await getTranslations({ locale, namespace: 'CategoryPage' });

const resolvedSearchParams = await searchParams;
const page = resolvedSearchParams['page'] ?? '1';
  const pageNumber = parseInt(page.toString(), 10);

  const paginatedResult = await getPaginatedPublishedDoubts(category, pageNumber);

  if (!paginatedResult || !paginatedResult.items) {
    return <div>Error loading data.</div>;
  }

  const { items: categoryDoubts, totalPages } = paginatedResult;

  let categoryTitle;
  if (category === 'quran') {
    categoryTitle = tCategory('quran');
  } else if (category === 'prophet') {
    categoryTitle = tCategory('prophet');
  } else if (category === 'science') {
    categoryTitle = tCategory('science');
  } else if (category === 'history') {
    categoryTitle = tCategory('history');
  } else {
    categoryTitle = "تصنيف غير معروف";
  }

  return (
    <div className="relative w-full min-h-screen select-none">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-purple-50 to-pink-100/50 blur-[120px]" />
        <div className="absolute bottom-0 -left-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-blue-50 to-indigo-50/50 blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-5xl mx-auto">
         <div className="mb-8 text-sm font-medium text-blue-900/70">
  <Link href="/" className="hover:text-blue-700">{tCategory('home')}</Link>
  <span className="mx-2">/</span>
  <span className="font-bold text-blue-900">{categoryTitle}</span>
</div>
<h1 className="text-5xl md:text-7xl font-black text-blue-900 mb-12">{categoryTitle}</h1>
          
          {categoryDoubts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {categoryDoubts.map((doubt) => (
                  <div key={doubt.id}> 
                    <DoubtCard doubt={doubt} />
                  </div>
                ))}
              </div>

              <div className="mt-16">
                <PaginationControls
                  currentPage={pageNumber}
                  totalPages={totalPages}
                  basePath={`/doubts/${category}`}
                />
              </div>
            </>
          ) : (
          // --- ✅ التعديل الثالث ---
<div className="text-center py-16 bg-blue-50/30 rounded-2xl border border-blue-200/30">
    <h2 className="text-2xl font-bold text-blue-900">{tCategory('noDoubtsTitle')}</h2>
    <p className="text-blue-900/60 mt-2">{tCategory('noDoubtsSubtitle')}</p>
</div>

          )}
        </div>
      </div>
    </div>
  );
}
