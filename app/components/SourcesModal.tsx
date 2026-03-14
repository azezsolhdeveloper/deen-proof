// app/components/SourcesModal.tsx (النسخة النهائية المصححة بالكامل )

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Source } from '../services/types';
import { FaTimes, FaExternalLinkAlt } from 'react-icons/fa';
import { useLocale, useTranslations } from 'next-intl'; // ✅✅✅ قم بتعديل هذا السطر ✅✅✅

type SourcesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  sources: Source[];
};

export default function SourcesModal({ isOpen, onClose, sources }: SourcesModalProps) {
   const locale = useLocale(); // ✅✅✅ أضف هذا السطر ✅✅✅
const t = useTranslations('ClaimCard');
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-slate-800">المصادر</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-800">
                <FaTimes size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {sources.length > 0 ? (
                <ul className="space-y-4">
                  {sources.map((source) => {
                    // --- ✅✅✅ بداية الكود المضاف للحماية ✅✅✅ ---
                    let finalUrl = source.url ?? '#';
                    if (finalUrl && finalUrl !== '#' && !finalUrl.startsWith('http' )) {
                      finalUrl = `https://` + finalUrl;
                    }
                    // --- نهاية الكود المضاف للحماية ---

                   return (
  <li key={source.id}>
    <a
      href={finalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-blue-50 transition-colors"
    >
      {(() => {
        // 1. نطبق المنطق الذكي لاختيار اسم المصدر الصحيح
        const sourceName = locale === 'ar' ? source.nameAr : (source.nameEn || source.nameAr);
        
        // 2. نستخدم المتغير الجديد هنا
        return <span className="font-medium text-slate-700 group-hover:text-blue-800">{sourceName}</span>;
      })()}
      <FaExternalLinkAlt className="text-slate-400 group-hover:text-blue-600 transition-transform group-hover:scale-110" />
    </a>
  </li>
);
                  })}
                </ul>
              ) : (
<p className="text-center text-slate-500 py-8">{t('noSourcesForClaim')}</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
