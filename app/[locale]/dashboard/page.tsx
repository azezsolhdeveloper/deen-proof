'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getDashboardData } from '../../services/api';
import { DashboardData, ReviewTask, ActivityLog } from '../../services/types';
import { useAuth } from '../../context/AuthContext';
import { Link } from '../../../i18n/routing';
import { IconType } from 'react-icons';
import { 
  FaRegFileAlt, FaRegClock, FaRegCheckCircle, 
  FaRegTimesCircle, FaPlus, FaArrowLeft, FaHistory,
  FaList, FaThumbsUp
} from 'react-icons/fa';
import { useNotification } from '../../context/NotificationContext';
import { ApiError } from '../../services/types';

// --- المكونات المساعدة (تبقى كما هي) ---

interface StatCardProps {
  label: string;
  value: number | undefined;
  icon: IconType;
  color: string;
}

const StatCard = ({ label, value, icon: Icon, color }: StatCardProps) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
    <div className="flex items-start justify-between">
      <div className="flex flex-col space-y-1">
        <span className="text-gray-500 font-medium">{label}</span>
        <span className="text-4xl font-bold text-gray-800">{value ?? 0}</span>
      </div>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white`} style={{ backgroundColor: color }}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

const ShortcutCard = ({ label, href, icon: Icon }: { label: string, href: string, icon: IconType }) => (
  <Link href={href} className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col justify-center items-center text-center group">
    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors mb-3">
      <Icon className="w-6 h-6" />
    </div>
    <span className="text-gray-700 font-semibold group-hover:text-blue-600 transition-colors">{label}</span>
  </Link>
);

// --- ✅✅✅ دالة توجيه الروابط (مهمة جدًا) ✅✅✅ ---
// هذه الدالة تحدد الرابط الصحيح للمهمة بناءً على حالتها
const getLinkForTask = (task: ReviewTask): string => {
  // إذا كانت المهمة "تحتاج تعديل"، فهي للباحث ويجب أن تذهب لصفحة التحرير
  if (task.status === 'NeedsRevision') {
    return `/dashboard/doubts/edit/${task.id}`;
  }
  // أي مهمة أخرى (PendingReview, PendingApproval) هي للمراجع ويجب أن تذهب لصفحة المراجعة
  return `/dashboard/review/${task.id}`;
};


// --- المكون الرئيسي للصفحة ---
export default function DashboardHomePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const t = useTranslations('DashboardHome');
  const locale = useLocale();
  const { addNotification } = useNotification();

  useEffect(() => {
    getDashboardData()
        .then(setData)
        .catch(err => {
            addNotification(t('fetchError'), 'error');
        })
        .finally(() => setIsLoading(false));
  }, [addNotification, t]);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      
      <header className="mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className={locale === 'ar' ? 'text-right' : 'text-left'}>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('welcome', { name: user?.name?.split(' ')[0] || '...' })}
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              {t('summary')}
            </p>
          </div>
          {(user?.role === 'Researcher' || user?.role === 'Admin' || user?.role === 'SuperAdmin') && (
            <Link 
              href="/dashboard/doubts/new" 
              className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold transition-all hover:bg-blue-700 active:scale-95 shadow-sm"
            >
               <FaPlus /> {t('addNewContent')}
            </Link>
          )}
        </div>
      </header>

      <section className="flex flex-wrap gap-6 mb-12">
        {(user?.role === 'Admin' || user?.role === 'SuperAdmin') && (
            <>
                <div className="flex-grow basis-[calc(33.33%-1rem)] min-w-[280px]"><StatCard label={t('totalEntries')} value={data?.stats.totalDoubts} icon={FaRegFileAlt} color="#3B82F6" /></div>
                <div className="flex-grow basis-[calc(33.33%-1rem)] min-w-[280px]"><StatCard label={t('published')} value={data?.stats.published} icon={FaRegCheckCircle} color="#10B981" /></div>
                <div className="flex-grow basis-[calc(33.33%-1rem)] min-w-[280px]"><StatCard label={t('inReview')} value={data?.stats.pendingReview} icon={FaRegClock} color="#F59E0B" /></div>
                <div className="flex-grow basis-[calc(50%-0.75rem)] min-w-[280px]"><StatCard label={t('needsRevision')} value={data?.stats.needsRevision} icon={FaRegTimesCircle} color="#EF4444" /></div>
                <div className="flex-grow basis-[calc(50%-0.75rem)] min-w-[280px]"><StatCard label={t('totalLikes')} value={data?.stats.totalLikes} icon={FaThumbsUp} color="#10B981" /></div>
            </>
        )}
        {user?.role === 'Reviewer' && (
            <>
                <div className="flex-grow basis-[calc(50%-0.75rem)] min-w-[280px]"><StatCard label={t('inReview')} value={data?.stats.pendingReview} icon={FaRegClock} color="#F59E0B" /></div>
                <div className="flex-grow basis-[calc(50%-0.75rem)] min-w-[280px]"><ShortcutCard label={t('viewAllTasks')} href="/dashboard/review" icon={FaList} /></div>
            </>
        )}
        {user?.role === 'Researcher' && (
            <>
                <div className="flex-grow basis-[calc(33.33%-1rem)] min-w-[280px]"><StatCard label={t('myDrafts')} value={data?.stats.myDrafts} icon={FaRegFileAlt} color="#6B7280" /></div>
                <div className="flex-grow basis-[calc(33.33%-1rem)] min-w-[280px]"><StatCard label={t('myRevisions')} value={data?.stats.myRevisions} icon={FaRegTimesCircle} color="#EF4444" /></div>
                <div className="flex-grow basis-[calc(33.33%-1rem)] min-w-[280px]"><ShortcutCard label={t('addNewContent')} href="/dashboard/doubts/new" icon={FaPlus} /></div>
            </>
        )}
      </section>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-sm ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-xl font-bold text-gray-800">{t('yourTasks')}</h2>
             {data?.myTasks && data.myTasks.length > 0 && (
               <Link href="/dashboard/review" className="text-sm font-semibold text-blue-600 hover:underline">{t('viewAll')}</Link>
             )}
          </div>
          
          <div className="space-y-4">
            {data?.myTasks && data.myTasks.length > 0 ? (
              data.myTasks.map((task: ReviewTask) => {
                const title = locale === 'ar' ? task.titleAr : (task.titleEn || task.titleAr);
                return (
                  <Link 
                    key={task.id} 
                    href={getLinkForTask(task)} // ✅ استخدام الدالة الجديدة هنا
                    className="group flex items-center justify-between p-4 rounded-lg transition-all bg-gray-50 hover:bg-blue-50 hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-white border flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                        <FaRegFileAlt className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{title}</h3>
                        <p className="text-sm text-gray-500">
                          {t('byAuthor', { authorName: task.authorName })}
                          <span className="mx-2 text-gray-300">•</span>
                          {new Date(task.updatedAt).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}
                        </p>                      
                      </div>
                    </div>
                    <div className={`text-gray-400 group-hover:text-blue-600 transition-transform ${locale === 'ar' ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1 rotate-180'}`}>
                      <FaArrowLeft />
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">{t('noTasks')}</p>
              </div>
            )}
          </div>
        </div>

        <div className={`bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-sm ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
          <h2 className="text-xl font-bold text-gray-800 mb-6">{t('recentActivity')}</h2>
          <div className="space-y-6">
            {data?.recentActivities && data.recentActivities.length > 0 ? (
              data.recentActivities.map((activity: ActivityLog) => {
                const doubtTitle = locale === 'ar' ? activity.doubtTitleAr : (activity.doubtTitleEn || activity.doubtTitleAr);
                return (
                  <div key={activity.id} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0 mt-1">
                      <FaHistory size={18}/>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        <span className="font-semibold text-gray-800">{activity.userName}</span>
                        {' '}
                        {t(activity.actionKey as 'addedNewDoubt')} 
                        {' '}
                        <span className="font-semibold text-gray-800">{doubtTitle}</span>
                      </p>
                      <span className="text-xs text-gray-400">
                        {new Date(activity.timestamp).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">{t('noActivity')}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
