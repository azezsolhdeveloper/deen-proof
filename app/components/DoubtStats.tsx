'use client'; // 👈 ضروري جداً

import { useEffect, useState } from 'react';
import { FaEye, FaHeart } from 'react-icons/fa';
import { useTranslations } from 'next-intl';

type DoubtStatsProps = {
  doubtId: string;      // 👈 نحتاج الـ ID لزيادة المشاهدات
  viewCount: number;    // هذه ستكون القيمة الأولية (Initial Value)
  likeCount: number;
  className?: string;
};

export default function DoubtStats({ doubtId, viewCount, likeCount, className }: DoubtStatsProps) {
  const t = useTranslations('Doubt');
  
  // نضع القيم القادمة من السيرفر كقيم أولية
  const [displayViews, setDisplayViews] = useState(viewCount);
  const [displayLikes, setDisplayLikes] = useState(likeCount);

  useEffect(() => {
    // 1. وظيفة لزيادة عدد المشاهدات وتحديث الأرقام
    const updateStats = async () => {
      try {
        // افترضنا أن هذا هو مسار الـ API الخاص بك
        const response = await fetch(`/api/public/doubts/${doubtId}/view`, {
          method: 'POST',
        });
        
        if (response.ok) {
          const data = await response.json();
          // تحديث الواجهة بالأرقام الحقيقية الجديدة من قاعدة البيانات
          setDisplayViews(data.viewCount);
          setDisplayLikes(data.likeCount);
        }
      } catch (error) {
        console.error("Failed to update stats:", error);
      }
    };

    updateStats();
  }, [doubtId]);

  return (
    <div className={`flex items-center gap-4 text-sm text-slate-500 ${className}`}>
      <div className="flex items-center gap-1.5">
        <FaEye className="text-blue-500" />
        <span>
          {displayViews.toLocaleString()} {t('views')}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <FaHeart className="text-pink-500" />
        <span>
          {displayLikes.toLocaleString()} {t('likes')}
        </span>
      </div>
    </div>
  );
}