// app/components/RouteGuard.tsx
'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter } from '../../i18n/routing';
import { useEffect } from 'react';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

// هذا المكون هو "الحارس"
export default function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // لا تفعل شيئًا أثناء التحميل
    if (isLoading) {
      return;
    }

    // إذا انتهى التحميل ولم يكن هناك مستخدم، أو كان دور المستخدم غير مسموح به
    if (!user || !allowedRoles.includes(user.role)) {
      // أعد توجيهه إلى لوحة التحكم الرئيسية (أو صفحة خطأ)
      console.warn(`Access denied. User role: ${user?.role}. Allowed: ${allowedRoles.join(', ')}`);
      router.replace('/dashboard');
    }
  }, [user, isLoading, allowedRoles, router]);

  // إذا كان التحميل لم ينتهِ بعد، أو كان المستخدم غير مصرح له، اعرض شاشة تحميل
  if (isLoading || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <p>جارٍ التحقق من الصلاحيات...</p>
      </div>
    );
  }

  // إذا كان كل شيء على ما يرام، اعرض محتوى الصفحة
  return <>{children}</>;
}
