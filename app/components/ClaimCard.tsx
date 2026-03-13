// app/components/ClaimCard.tsx (النسخة النهائية مع نظام الإشعارات)

'use client';

import { useState, useEffect } from 'react';
import { FaLink, FaShareAlt, FaBook } from 'react-icons/fa';
import SourcesModal from './SourcesModal';
import { Source } from '../services/types';
import { useTranslations } from 'next-intl';
// --- ✅ 1. استيراد نظام الإشعارات ---
import { useNotification } from '../context/NotificationContext';

type ClaimCardProps = {
  claim: string;
  response: string;
  sources: Source[];
  claimIndex: number;
};

export default function ClaimCard({ claim, response, sources, claimIndex }: ClaimCardProps) {
  const claimId = `claim-${claimIndex}`;
  const t = useTranslations('ClaimCard');
  // --- ✅ 2. تهيئة نظام الإشعارات ---
  const { addNotification } = useNotification();
  
  const [url, setUrl] = useState(''); 
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setUrl(`${window.location.origin}${window.location.pathname}#${claimId}`);
  }, [claimId]);

  // --- ✅ 3. تحديث دالة نسخ الرد ---
  const copyResponse = () => {
    navigator.clipboard.writeText(response)
      .then(() => {
        addNotification(t('copySuccess'), 'success');
      })
      .catch(err => {
        console.error('Failed to copy response: ', err);
        addNotification(t('copyError'), 'error');
      });
  };

  // --- ✅ 4. تحديث دالة مشاركة الادعاء ---
  const shareClaim = () => {
    if (!url) return;
    navigator.clipboard.writeText(url)
      .then(() => {
        addNotification(t('shareSuccess'), 'success');
      })
      .catch(err => {
        console.error('Failed to copy claim link: ', err);
        addNotification(t('shareError'), 'error');
      });
  };

  return (
    <>
      <SourcesModal 
        sources={sources}
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <div id={claimId} className="relative bg-white/50 backdrop-blur-md border border-slate-200/50 rounded-3xl p-8 scroll-mt-24 shadow-lg shadow-slate-900/5">
        <h3 className="text-xl font-bold text-blue-900 mb-4">{claim}</h3>
        <p className="text-slate-700 leading-relaxed whitespace-pre-line">{response}</p>
        
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-6 pt-4 border-t border-slate-200">
          <button onClick={copyResponse} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-700 transition-colors">
            <FaLink />
            <span>{t('copyResponse')}</span>
          </button>
          
          <button onClick={shareClaim} disabled={!url} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors disabled:opacity-50">
            <FaShareAlt />
            <span>{t('shareClaim')}</span>
          </button>
          
          {sources && sources.length > 0 && (
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-purple-600 transition-colors">
              <FaBook />
              <span>{t('viewSources')} ({sources.length})</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
