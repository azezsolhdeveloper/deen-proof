// app/components/DoubtStats.tsx
import { FaEye, FaHeart } from 'react-icons/fa';
import { useTranslations } from 'next-intl';

type DoubtStatsProps = {
  viewCount: number;
  likeCount: number;
  className?: string;
};

export default function DoubtStats({ viewCount, likeCount, className }: DoubtStatsProps) {
  const t = useTranslations('Doubt');

  return (
    <div className={`flex items-center gap-4 text-sm text-slate-500 ${className}`}>
      <div className="flex items-center gap-1.5">
        <FaEye />
        <span>{viewCount.toLocaleString()} {t('views')}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <FaHeart className="text-pink-500" />
        <span>{likeCount.toLocaleString()} {t('likes')}</span>
      </div>
    </div>
  );
}
