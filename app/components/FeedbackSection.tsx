// app/components/FeedbackSection.tsx (النسخة النهائية مع نظام الإشعارات)

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { FaHeart, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';
import { submitFeedback, recordLike } from '@/app/services/api';
// --- ✅ 1. استيراد نظام الإشعارات ---
import { useNotification } from '../context/NotificationContext';

type FeedbackSectionProps = {
  doubtId: number;
};

export default function FeedbackSection({ doubtId }: FeedbackSectionProps) {
  const t = useTranslations('Feedback');
  // --- ✅ 2. تهيئة نظام الإشعارات ---
  const { addNotification } = useNotification();

  const [isLiked, setIsLiked] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleLike = async () => {
    if (isLiked) return;
    setIsLiked(true);
    try {
      await recordLike(doubtId);
      console.log('Like recorded successfully');
    } catch (error) {
      console.error('Failed to record like:', error);
      setIsLiked(false);
    }
  };

  // --- ✅ 3. تحديث دالة الإرسال لاستخدام الإشعارات ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 10) {
      // استبدال alert بالإشعار الجديد
      addNotification(t('messageTooShort'), 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      await submitFeedback({ doubtId, message });
      setFeedbackSent(true);
    } catch (error) {
      console.error('Feedback submission failed:', error);
      // استبدال alert بالإشعار الجديد
      addNotification(t('submissionError'), 'error');
    }
    setIsSubmitting(false);
  };

  if (feedbackSent) {
    return (
      <div className="text-center py-12">
        <FaCheckCircle className="mx-auto text-5xl text-green-500 mb-4" />
        <h3 className="text-2xl font-bold" style={{ color: '#1e3a8a' }}>{t('thanksTitle')}</h3>
        <p className="text-slate-600 mt-2 max-w-md mx-auto">{t('thanksMessage')}</p>
      </div>
    );
  }

  return (
    <div className="text-center py-12 border-t border-slate-200/80">
      <h3 className="text-2xl font-bold" style={{ color: '#1e3a8a' }}>{t('wasHelpful')}</h3>
      <p className="mt-2 text-slate-500">{t('feedbackPrompt')}</p>

      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          onClick={handleLike}
          disabled={isLiked}
          className={`flex items-center gap-2.5 px-5 py-2.5 font-semibold rounded-full transition-all duration-300 ease-in-out transform
            ${
              isLiked
                ? 'bg-pink-500 text-white shadow-lg scale-105'
                : 'bg-white text-slate-700 hover:text-pink-500 border border-slate-300 hover:border-pink-300 hover:scale-105'
            }`}
        >
          <FaHeart className={isLiked ? 'text-white' : 'text-pink-400'} />
          <span>{isLiked ? t('liked') : t('likeButton')}</span>
        </button>

        <button
          onClick={() => setShowForm(!showForm)}
          className="font-semibold transition-colors py-2.5 px-4"
          style={{ color: '#1d4ed8' }}
          onMouseOver={(e) => e.currentTarget.style.color = '#1e3a8a'}
          onMouseOut={(e) => e.currentTarget.style.color = '#1d4ed8'}
        >
          {t('contactButton')}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <form 
              onSubmit={handleSubmit} 
              className="mt-8 max-w-xl mx-auto text-left p-6 bg-white/50 backdrop-blur-md rounded-2xl border border-slate-200/50 shadow-sm"
            >
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('formPlaceholder')}
                className="w-full p-4 bg-white/70 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1d4ed8] focus:border-[#1e3a8a] transition-shadow duration-200"
                rows={5}
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 flex items-center justify-center gap-3 px-6 py-3 font-bold text-white rounded-lg transition-all duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                style={{ backgroundColor: isSubmitting ? '#94a3b8' : '#1d4ed8' }}
                onMouseOver={(e) => { if (!isSubmitting) e.currentTarget.style.backgroundColor = '#1e3a8a'; }}
                onMouseOut={(e) => { if (!isSubmitting) e.currentTarget.style.backgroundColor = '#1d4ed8'; }}
              >
                <FaPaperPlane />
                <span>{isSubmitting ? t('submitting') : t('submitButton')}</span>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
