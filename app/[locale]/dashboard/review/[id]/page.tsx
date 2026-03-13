'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '../../../../../i18n/routing';
import { getDoubtById, updateDoubtStatus, addComment } from '../../../../services/api';
import { DoubtDetail, Comment, ApiError } from '../../../../services/types';
import { useAuth } from '../../../../context/AuthContext';
import { useNotification } from '../../../../context/NotificationContext';
import ConfirmationModal from '../../../../components/ConfirmationModal';
import { FaCheck, FaTimes, FaPaperPlane, FaSpinner } from 'react-icons/fa';

// --- المكونات المساعدة (Spinner, ReviewSection, CommentsThread) تبقى كما هي ---
function Spinner({ message }: { message: string }) {
    return (
        <div className="flex justify-center items-center h-screen">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="mr-4 text-slate-600">{message}</span>
        </div>
       );
}

function ReviewSection({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <section className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">{title}</h2>
            <div className="text-slate-700 leading-relaxed prose max-w-none prose-h3:font-bold prose-hr:my-4">
                {children}
            </div>
        </section>
    );
}

function CommentsThread({ comments }: { comments: Comment[] }) {
    const t = useTranslations('ReviewPage');
    if (comments.length === 0) return null;

    return (
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-yellow-800 mb-4">{t('revisionNotes')}</h3>
            <div className="space-y-4">
                {comments.map(comment => (
                    <div key={comment.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-yellow-200 text-yellow-700 flex items-center justify-center font-bold flex-shrink-0">
                            {(comment.authorName || 'A').charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm text-yellow-900">{comment.content}</p>
                            <p className="text-xs text-yellow-600 mt-1">{comment.authorName}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- المكون الرئيسي للصفحة ---
export default function ReviewPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { user: currentUser } = useAuth();
    const t = useTranslations('ReviewPage');
    const locale = useLocale();
    const { addNotification } = useNotification();

    const [doubt, setDoubt] = useState<DoubtDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [commentContent, setCommentContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- ✅ 1. تبسيط حالة نافذة التأكيد ---
    const [confirmation, setConfirmation] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; } | null>(null);

    useEffect(() => {
        if (!id) return;
        const fetchDoubt = async () => {
            setIsLoading(true);
            try {
                const data = await getDoubtById(id);
                setDoubt(data);
            } catch (err) {
                setError(t('loadingError'));
                addNotification(t('loadingError'), 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDoubt();
    }, [id, t, addNotification]);

    // --- ✅ 2. تبسيط دالة تغيير الحالة ---
    const handleStatusChange = (newStatus: 'NeedsRevision' | 'PendingApproval' | 'Published') => {
        if (!doubt) return;
        
        if (newStatus === 'NeedsRevision' && doubt.comments.length === 0 && !commentContent.trim()) {
            addNotification(t('addCommentFirstError'), 'warning');
            return;
        }

        const confirmMessageKey = newStatus === 'NeedsRevision' ? 'confirmRequestRevision' : newStatus === 'PendingApproval' ? 'confirmApproveAndElevate' : 'confirmApproveAndPublish';
        
        setConfirmation({
            isOpen: true,
            title: t('confirmActionTitle'),
            message: t(confirmMessageKey),
            onConfirm: async () => {
                setIsSubmitting(true);
                try {
                    // إذا كان الإجراء يتطلب مراجعة وكان هناك تعليق جديد، أضفه أولاً
                    if (newStatus === 'NeedsRevision' && commentContent.trim()) {
                        const newComment = await addComment(doubt.id, { section: 'general', content: commentContent });
                        setDoubt(prev => prev ? { ...prev, comments: [...prev.comments, newComment] } : null);
                        setCommentContent('');
                    }
                    
                    // ثم قم بتحديث حالة الشبهة
                    await updateDoubtStatus(doubt.id, newStatus);
                    addNotification(t('statusUpdateSuccess'), 'success');
                    
                    // أخيرًا، أعد التوجيه بعد فترة قصيرة
                    setTimeout(() => router.push('/dashboard/review'), 1500);

                } catch (err) {
                    const apiError = err as ApiError;
                    const errorMessage = apiError.response?.data?.message || t('statusUpdateError');
                    addNotification(errorMessage, 'error');
                } finally {
                    setIsSubmitting(false);
                    setConfirmation(null); // أغلق النافذة بعد الانتهاء
                }
            }
        });
    };

    if (isLoading) return <Spinner message={t('loadingMessage')} />;
    if (error) return <div className="text-center text-red-500 p-8">{error}</div>;
    if (!doubt) return <div className="text-center text-slate-500 p-8">{t('notFound')}</div>;

    const title = locale === 'ar' ? doubt.titleAr : (doubt.titleEn || doubt.titleAr);
    const summary = locale === 'ar' ? doubt.summaryAr : (doubt.summaryEn || doubt.summaryAr);
    const quickReply = locale === 'ar' ? doubt.quickReplyAr : (doubt.quickReplyEn || doubt.quickReplyAr);

    return (
        <>
            {/* --- ✅ 3. تبسيط استخدام نافذة التأكيد --- */}
            {confirmation && (
                <ConfirmationModal
                    isOpen={confirmation.isOpen}
                    title={confirmation.title}
                    message={confirmation.message}
                    onConfirm={confirmation.onConfirm}
                    onCancel={() => setConfirmation(null)}
                />
            )}

            <div className="p-4 sm:p-8 w-full bg-slate-50/50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                <div className="max-w-5xl mx-auto">
                    <header className={`mb-12 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                        <h1 className="text-4xl font-black text-slate-800">{t('pageTitle')}</h1>
                        <p className="text-slate-500 mt-2">{t('pageSubtitle')} <span className="font-bold text-slate-700">{title}</span></p>
                        <p className="text-sm text-slate-500 mt-1">{t('authorLabel')} <span className="font-semibold">{doubt.authorName}</span></p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <main className="lg:col-span-2 space-y-10">
                            <ReviewSection title={t('summarySectionTitle')}>
                                <h3>{t('summaryLabel')}</h3>
                                <p>{summary}</p>
                                <hr/>
                                <h3>{t('quickReplyLabel')}</h3>
                                <p>{quickReply}</p>
                            </ReviewSection>
                            <ReviewSection title={t('detailedRebuttalSectionTitle')}>
                                <div className="space-y-6">
                                    {doubt.detailedRebuttal.map((claim) => (
                                        <div key={claim.id} className="p-4 bg-slate-50 rounded-lg border">
                                            <h4 className="font-bold text-lg text-slate-800 mb-2">{locale === 'ar' ? claim.claimAr : (claim.claimEn || claim.claimAr)}</h4>
                                            <p>{locale === 'ar' ? claim.responseAr : (claim.responseEn || claim.responseAr)}</p>
                                        </div>
                                    ))}
                                </div>
                            </ReviewSection>
                        </main>

                        <aside className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">
                                <CommentsThread comments={doubt.comments} />
                                
                                <div className="bg-white p-6 rounded-2xl shadow-xl">
                                    <h3 className={`text-lg font-bold text-slate-700 border-b pb-4 mb-4 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('decisionSectionTitle')}</h3>
                                    
                                    <div className="space-y-4">
                                        <p className="text-sm text-slate-500">{t('decisionPrompt')}</p>
                                        
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600 mb-2 block">{t('addComment')}</label>
                                            <textarea 
                                                value={commentContent}
                                                onChange={(e) => setCommentContent(e.target.value)}
                                                rows={3}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder={t('commentPlaceholder')}
                                                disabled={isSubmitting}
                                            ></textarea>
                                        </div>

                                        {/* --- ✅ 4. تعطيل الأزرار أثناء الإرسال --- */}
                                        <button onClick={() => handleStatusChange('NeedsRevision')} disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold disabled:bg-red-400">
                                            {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaTimes />}
                                            <span>{t('requestRevisionButton')}</span>
                                        </button>
                                        
                                        {currentUser?.role === 'Reviewer' && (
                                            <button onClick={() => handleStatusChange('PendingApproval')} disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold disabled:bg-blue-400">
                                                {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                                                <span>{t('approveAndElevateButton')}</span>
                                            </button>
                                        )}

                                        {(currentUser?.role === 'Admin' || currentUser?.role === 'SuperAdmin') && (
                                            <button onClick={() => handleStatusChange('Published')} disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold disabled:bg-green-400">
                                                {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                                                <span>{t('approveAndPublishButton')}</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </>
    );
}
