// app/components/ShareButtons.tsx (النسخة النهائية مع نظام الإشعارات)

'use client';

import { useState, useEffect } from 'react';
import { FaTwitter, FaFacebook, FaWhatsapp, FaLink } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
// --- ✅ 1. استيراد نظام الإشعارات ---
import { useNotification } from '../context/NotificationContext';

export default function ShareButtons({ title }: { title: string }) {
  const [isClient, setIsClient] = useState(false);
  const t = useTranslations('ShareButtons');
  // --- ✅ 2. تهيئة نظام الإشعارات ---
  const { addNotification } = useNotification();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClient(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // إذا لم نكن في المتصفح بعد، نعرض نسخة التحميل
  if (!isClient) {
    return (
      <div className="flex items-center gap-3 animate-pulse">
        <span className="text-sm font-bold text-slate-500">{t('share')}</span>
        <div className="w-6 h-6 bg-slate-200 rounded-full"></div>
        <div className="w-6 h-6 bg-slate-200 rounded-full"></div>
        <div className="w-6 h-6 bg-slate-200 rounded-full"></div>
        <div className="w-6 h-6 bg-slate-200 rounded-full"></div>
      </div>
    );
  }

  // الآن يمكننا استخدام window بأمان
  const url = window.location.href;

  // --- ✅ 3. تحديث دالة النسخ لاستخدام الإشعارات ---
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      // استبدال alert بالإشعار الجديد
      addNotification(t('copySuccess'), 'success');
    }).catch(err => {
      console.error('Failed to copy: ', err);
      // إضافة إشعار في حالة الفشل
      addNotification(t('copyError'), 'error');
    });
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-bold text-slate-500">{t('share')}</span>
      <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url )}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#1DA1F2] transition-colors">
        <FaTwitter size={22} />
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url )}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#1877F2] transition-colors">
        <FaFacebook size={22} />
      </a>
      <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(title )} ${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#25D366] transition-colors">
        <FaWhatsapp size={22} />
      </a>
      <button onClick={copyToClipboard} className="text-slate-400 hover:text-blue-600 transition-colors">
        <FaLink size={22} />
      </button>
    </div>
  );
}
