// app/[locale]/(visitor)/page.tsx

import { getCategoryStats } from '../../services/api';
import HomePageClient from './HomePageClient'; // ✅ استيراد مكون العميل الجديد

// هذا المكون يبقى مكون خادم
export default async function HomePage() {
  // 1. جلب البيانات على الخادم
  const categoryStats = await getCategoryStats();
  const statsMap = new Map(categoryStats.map(stat => [stat.category, stat.count]));

  // 2. تمرير البيانات إلى مكون العميل
  return <HomePageClient statsMap={statsMap} />;
}
