// i18n/routing.ts (النسخة النهائية المصححة)

import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

// 1. تعريف وتصدير 'locales' كمتغير مستقل
export const locales = ['ar', 'en'] as const;

// 2. تعريف وتصدير 'routing' باستخدام المتغير 'locales'
export const routing = defineRouting({
  locales: locales, // <-- استخدام المتغير هنا
  defaultLocale: 'ar'
});

// 3. باقي الكود يبقى كما هو
export const {Link, redirect, usePathname, useRouter} =
  createNavigation(routing);
