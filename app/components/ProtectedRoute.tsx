'use client';

import { useEffect } from 'react';
import { useRouter } from '../../i18n/routing'; // مسار نسبي
import { useAuth } from '../context/AuthContext'; // مسار نسبي

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // --- ✅✅✅ هذا هو المنطق الجديد والذكي ---

    // 1. انتظر حتى ينتهي التحميل الأولي تمامًا
    if (isLoading) {
      return; // لا تفعل أي شيء، فقط انتظر
    }

    // 2. بعد انتهاء التحميل، تحقق مما إذا كان هناك مستخدم
    if (!user) {
      // إذا لم يكن هناك مستخدم، قم بإعادة التوجيه إلى صفحة تسجيل الدخول
      router.replace('/login');
    }

  }, [user, isLoading, router]);

  // --- ✅✅✅ عرض المحتوى المحمي ---

  // إذا كان التحميل لا يزال جاريًا، أو إذا لم يكن هناك مستخدم (وسيتم إعادة توجيهه قريبًا)،
  // اعرض رسالة تحميل بدلاً من المحتوى الحقيقي لتجنب الوميض.
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <p>جارٍ التحقق من المصادقة...</p>
      </div>
    );
  }

  // إذا انتهى التحميل وهناك مستخدم، اعرض المحتوى المحمي (الأطفال)
  return <>{children}</>;
}
