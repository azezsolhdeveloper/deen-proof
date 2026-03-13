'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
// --- ✅✅✅ بداية الإصلاح الحقيقي والنهائي ✅✅✅ ---
import { getFeedbackSubmissions, updateFeedbackStatus } from '../../../services/api'; 
// --- نهاية الإصلاح ---
import { FeedbackSubmission } from '../../../services/types';
import { Link } from '../../../../i18n/routing';
import RouteGuard from '../../../components/RouteGuard';
import { FaInbox, FaRegClock, FaRegCheckCircle, FaThumbsUp, FaExternalLinkAlt } from 'react-icons/fa';
import { IconType } from 'react-icons';
import { useNotification } from '../../../context/NotificationContext';
import { ApiError } from '../../../services/types';
// ... (باقي المكونات المساعدة تبقى كما هي)
const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
);

const StatCard = ({ label, value, icon: Icon, color }: { label: string, value: number, icon: IconType, color: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
    <div className="flex items-start justify-between">
      <div className="flex flex-col space-y-1">
        <span className="text-gray-500 font-medium">{label}</span>
        {/* الآن، نحن نتحقق مما إذا كانت القيمة رقمًا صالحًا. إذا لم تكن كذلك، نعرض 0. */}
        <span className="text-4xl font-bold text-gray-800">{isNaN(value) ? 0 : value}</span>
      </div>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white`} style={{ backgroundColor: color }}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

const FeedbackCard = ({ fb, onToggleRead }: { fb: FeedbackSubmission, onToggleRead: (id: number, isRead: boolean) => void }) => {
    const locale = useLocale();
    const t = useTranslations('FeedbackPage');
    
    return (
        <div className={`bg-white p-6 rounded-2xl border-2 transition-all ${!fb.isRead ? 'border-blue-400 shadow-lg' : 'border-gray-200/80 shadow-sm'}`}>
            <p className="text-gray-800 leading-relaxed mb-4">{fb.message}</p>
            <div className="border-t border-gray-200 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1 text-sm">
                    <div className="font-semibold text-gray-600">{t('relatedTo')}: 
                       <Link href={`/doubts/${fb.doubtCategory}/${fb.doubtSlug}`} className="text-blue-600 hover:underline ml-1" target="_blank">
    {fb.doubtTitle} <FaExternalLinkAlt className="inline-block h-3 w-3" />
</Link>
                    </div>
                    <div className="text-xs text-gray-400">
                        {new Date(fb.submittedAt).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                   
                    <button 
                        onClick={() => onToggleRead(fb.id, !fb.isRead)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-full flex items-center gap-1.5 transition-colors ${
                            fb.isRead 
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                        {fb.isRead ? <FaRegClock /> : <FaRegCheckCircle />}
                        {fb.isRead ? t('markAsUnread') : t('markAsRead')}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- المكون الرئيسي للصفحة ---
export default function FeedbackPage() {
    const [feedbacks, setFeedbacks] = useState<FeedbackSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const t = useTranslations('FeedbackPage');
    const locale = useLocale();
  const { addNotification } = useNotification(); // <-- الإضافة الجديدة

   useEffect(() => {
    getFeedbackSubmissions()
        .then(data => setFeedbacks(data))
        .catch(err => {
            console.error("Error fetching feedback:", err);
            // استخدام إشعار من نوع "خطأ"
            addNotification(t('fetchError'), 'error');
        })
        .finally(() => setIsLoading(false));
}, [addNotification, t]); // <-- أضف addNotification و t إلى مصفوفة الاعتماديات


    const handleToggleReadStatus = async (id: number, newStatus: boolean) => {
    // التحديث الفوري للواجهة (تحديث متفائل)
    const originalFeedbacks = feedbacks;
    setFeedbacks(prev => prev.map(fb => fb.id === id ? { ...fb, isRead: newStatus } : fb));

    try {
        await updateFeedbackStatus(id, newStatus);
        // لا حاجة لإشعار هنا لجعل الواجهة أقل إزعاجًا، فالتغيير واضح بصريًا
    } catch (error) {
        // في حالة الفشل، تراجع عن التغيير واعرض إشعار خطأ
        setFeedbacks(originalFeedbacks);
        const apiError = error as ApiError;
        const errorMessage = apiError.response?.data?.message || t('updateStatusError');
        addNotification(errorMessage, 'error');
    }
};


    const stats = useMemo(() => {
    const total = feedbacks.length;
    const unread = feedbacks.filter(fb => !fb.isRead).length;
    
    // الآن، نحن نتحقق أولاً إذا كانت القائمة تحتوي على عناصر.
    // إذا كانت فارغة، فإننا نرجع 0 مباشرة.
    const totalLikesOnFeedbackDoubts = feedbacks.length > 0 
        ? feedbacks.reduce((sum, fb) => sum + fb.doubtLikeCount, 0)
        : 0;

    return { total, unread, totalLikesOnFeedbackDoubts };
}, [feedbacks]);
    if (isLoading) return <LoadingSpinner />;

    return (
        <RouteGuard allowedRoles={['Admin', 'SuperAdmin']}>
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">{t('pageTitle')}</h1>
                    <p className="mt-2 text-lg text-gray-600">{t('pageSubtitle')}</p>
                </header>

                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    <StatCard label={t('totalFeedback')} value={stats.total} icon={FaInbox} color="#3B82F6" />
                    <StatCard label={t('unreadFeedback')} value={stats.unread} icon={FaRegClock} color="#F59E0B" />
                    <StatCard label={t('totalLikes')} value={stats.totalLikesOnFeedbackDoubts} icon={FaThumbsUp} color="#10B981" />
                </section>

                {feedbacks.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border">
                        <FaInbox className="mx-auto text-5xl text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700">{t('noFeedbackTitle')}</h3>
                        <p className="text-gray-500 mt-2">{t('noFeedbackSubtitle')}</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {feedbacks.map((fb) => (
                            <FeedbackCard key={fb.id} fb={fb} onToggleRead={handleToggleReadStatus} />
                        ))}
                    </div>
                )}
            </div>
        </RouteGuard>
    );
}
