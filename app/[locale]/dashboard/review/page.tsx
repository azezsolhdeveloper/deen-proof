'use client';

import React, { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import RouteGuard from '../../../components/RouteGuard';
import { useTranslations, useLocale } from 'next-intl';
import { getDoubtsForReview } from '../../../services/api';
import { Submission, User } from '../../../services/types';
import { useAuth } from '../../../context/AuthContext';
import { 
  FaExclamationTriangle, FaCheckCircle, FaClock,
  FaRegClock, FaRegCommentDots
} from 'react-icons/fa';
import { IconType } from 'react-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../../context/NotificationContext';

const StatCard = ({ label, value, icon: Icon, color }: { label: string, value: number, icon: IconType, color: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
    <div className="flex items-start justify-between">
      <div className="flex flex-col space-y-1 text-right">
        <span className="text-gray-500 font-medium">{label}</span>
        <span className="text-4xl font-bold text-gray-800">{value}</span>
      </div>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white`} style={{ backgroundColor: color }}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

const TaskCard = ({ sub, currentUser }: { sub: Submission, currentUser: User | null }) => {
  const locale = useLocale();
  const submittedSince = new Date(sub.submittedAt).toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  const title = locale === 'ar' ? sub.titleAr : (sub.titleEn || sub.titleAr);
  const authorInitial = sub.authorName ? sub.authorName.charAt(0).toUpperCase() : '?';

  const isReadOnly = 
    sub.status === 'PendingApproval' &&
    currentUser?.role === 'Reviewer';

  const cardStyles = isReadOnly
    ? "block bg-gray-100 p-5 rounded-xl border border-gray-200/80 shadow-sm opacity-70 cursor-not-allowed"
    : "block group bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm hover:border-blue-400 hover:shadow-lg transition-all duration-300";

  const CardComponent = isReadOnly ? 'div' : Link;

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
      <CardComponent href={`/dashboard/review/${sub.id}`} className={cardStyles}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 text-right">
            <h3 className={`font-bold transition-colors mb-2 ${isReadOnly ? 'text-gray-500' : 'text-gray-800 group-hover:text-blue-600'}`}>{title}</h3>
            <div className="flex items-center justify-end gap-3 text-xs text-gray-500">
              <span className="font-semibold text-gray-600">{sub.authorName}</span>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1.5">
                <FaRegClock />
                <span>{submittedSince}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FaRegCommentDots />
                <span>{sub.commentCount}</span>
              </div>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm flex-shrink-0 ${isReadOnly ? 'bg-gray-200 text-gray-500' : 'bg-blue-100 text-blue-600'}`}>
              {authorInitial}
            </div>
          </div>
        </div>
      </CardComponent>
    </motion.div>
  );
};

const KanbanColumn = ({ title, items, icon: Icon, color, currentUser }: { title: string, items: Submission[], icon: IconType, color: string, currentUser: User | null }) => {
  const t = useTranslations('ReviewDashboardPage');
  return (
    <div className="flex-1 min-w-[320px] max-w-[400px] bg-gray-50/70 p-4 rounded-2xl">
      <div className="flex items-center gap-3 mb-5 px-2 justify-end">
        <span className="text-sm font-bold text-gray-500 bg-gray-200/80 w-6 h-6 flex items-center justify-center rounded-full">{items.length}</span>
        <h3 className="font-bold text-lg text-gray-800">{title}</h3>
        <Icon className="text-xl" style={{ color }} />
      </div>
      <div className="space-y-3">
        <AnimatePresence>
          {items.map(sub => <TaskCard key={sub.id} sub={sub} currentUser={currentUser} />)}
        </AnimatePresence>
        {items.length === 0 && (
          <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-gray-400 font-medium">{t('noTasksHere')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function ReviewDashboardPage() {
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'mine'>('all');
  
  const t = useTranslations('ReviewDashboardPage');
  const locale = useLocale();
  const { user: currentUser } = useAuth();
  const { addNotification } = useNotification();

  useEffect(() => {
    getDoubtsForReview()
      .then(data => setAllSubmissions(data))
      .catch(err => {
          console.error("Error fetching submissions:", err);
          addNotification(t('fetchError'), 'error');
      })
      .finally(() => setIsLoading(false));
  }, [addNotification, t]);

  const submissions = filter === 'mine' ? allSubmissions.filter(s => s.authorName === currentUser?.name) : allSubmissions;

  const pendingReview = submissions.filter(s => s.status === 'PendingReview');
  const pendingApproval = submissions.filter(s => s.status === 'PendingApproval');
  const needsRevision = submissions.filter(s => s.status === 'NeedsRevision');

  return (
    <RouteGuard allowedRoles={['Reviewer', 'Admin', 'SuperAdmin']}>
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      
        <header className="mb-10">
          <div className={`flex flex-col sm:flex-row justify-between items-start gap-4 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('pageTitle')}</h1>
              <p className="mt-2 text-lg text-gray-600">{t('pageSubtitle')}</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="bg-gray-200/80 p-1 rounded-lg flex items-center text-sm font-semibold flex-grow">
                 <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-md transition-all w-1/2 ${filter === 'all' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}>{t('allTasks')}</button>
                 <button onClick={() => setFilter('mine')} className={`px-4 py-2 rounded-md transition-all w-1/2 ${filter === 'mine' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}>{t('myTasks')}</button>
              </div>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <StatCard label={t('inReview')} value={pendingReview.length} icon={FaClock} color="#F59E0B" />
          <StatCard label={t('pendingApproval')} value={pendingApproval.length} icon={FaCheckCircle} color="#6366F1" />
          <StatCard label={t('needsRevision')} value={needsRevision.length} icon={FaExclamationTriangle} color="#EF4444" />
        </section>

        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4">
            <KanbanColumn title={t('inReview')} items={pendingReview} icon={FaClock} color="#F59E0B" currentUser={currentUser} />
            <KanbanColumn title={t('managerApproval')} items={pendingApproval} icon={FaCheckCircle} color="#6366F1" currentUser={currentUser} />
            <KanbanColumn title={t('needsRevision')} items={needsRevision} icon={FaExclamationTriangle} color="#EF4444" currentUser={currentUser} />
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
