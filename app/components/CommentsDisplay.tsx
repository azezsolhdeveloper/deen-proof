'use client';

import React from 'react';
import { Comment } from '../services/types'; // تأكد من أن المسار صحيح
import { useTranslations } from 'next-intl';
import { FaRegCommentDots } from 'react-icons/fa';

interface CommentsDisplayProps {
  comments: Comment[];
}

export default function CommentsDisplay({ comments }: CommentsDisplayProps) {
  const t = useTranslations('ReviewPage');

  // لا نعرض أي شيء إذا لم تكن هناك تعليقات
  if (!comments || comments.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-2 border-dashed border-yellow-300 p-6 rounded-2xl mb-8">
      <div className="flex items-center gap-3 mb-4">
        <FaRegCommentDots className="text-2xl text-yellow-600" />
        <h3 className="text-xl font-bold text-yellow-800">{t('revisionNotes')}</h3>
      </div>
      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment.id} className="flex items-start gap-3 bg-white/50 p-4 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-yellow-200 text-yellow-700 flex items-center justify-center font-bold flex-shrink-0 border-2 border-white">
              {comment.authorName ? comment.authorName.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="flex-1">
              <p className="text-base text-yellow-900">{comment.content}</p>
              <p className="text-xs text-yellow-600 mt-1">
                {comment.authorName}
                <span className="mx-1.5">•</span>
                {new Date(comment.createdAt).toLocaleDateString('ar', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
