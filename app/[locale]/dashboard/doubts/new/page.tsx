'use client';
import RouteGuard from '../../../../components/RouteGuard'; // استيراد الحارس

import React, { useState } from 'react';
import { useRouter } from '@/i18n/routing';
// ✅ 1. استيراد أدوات الترجمة
import { useTranslations, useLocale } from 'next-intl';
import { createDoubt } from '../../../../services/api';
import { CreateDoubtPayload } from '../../../../services/types';
import { FaSave, FaSpinner, FaInfoCircle, FaBolt, FaListUl, FaBookOpen, FaChevronDown } from 'react-icons/fa';
import { LuFilePlus2 } from 'react-icons/lu';
import { useNotification } from '../../../../context/NotificationContext';
import { ApiError } from '../../../../services/types';
// --- مكونات الواجهة المعيارية (مع الترجمة) ---
const FormSection = ({ icon, title, children, isLocked = false }: { icon: React.ReactNode, title: string, children?: React.ReactNode, isLocked?: boolean }) => {
  const t = useTranslations('NewDoubtPage');
  return (
    <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-sm">
      <div className="flex items-center gap-3 mb-6 justify-end">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <div className="text-gray-500">{icon}</div>
      </div>
      {isLocked ? (
        <div className="text-center py-10 px-4 bg-gray-50 rounded-lg">
          <p className="text-gray-500 font-medium">{t('lockedSectionTitle')}</p>
          <p className="text-sm text-gray-400 mt-1">{t('lockedSectionSubtitle')}</p>
        </div>
      ) : (
        <div className="space-y-6">{children}</div>
      )}
    </section>
  );
};

const FormField = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-600 mb-2 text-right">{label}</label>
    {children}
  </div>
);

// --- المكون الرئيسي للصفحة ---
export default function NewDoubtPage() {
  const router = useRouter();
  // ✅ 2. تهيئة أدوات الترجمة
  const t = useTranslations('NewDoubtPage');
  const tCat = useTranslations('CategoryPage'); // لترجمة أسماء الأقسام
  const locale = useLocale();

  const [isSaving, setIsSaving] = useState(false);
  const [doubtData, setDoubtData] = useState<CreateDoubtPayload>({
    titleAr: '', titleEn: '', summaryAr: '', summaryEn: '', category: '',
  });
  const { addNotification } = useNotification();

  const categories = [
    { id: 'quran', name: tCat('quran'), icon: "📖" },
    { id: 'prophet', name: tCat('prophet'), icon: "🕌" },
    { id: 'science', name: tCat('science'), icon: "🔬" },
    { id: 'history', name: tCat('history'), icon: "📜" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setDoubtData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateDoubt = async () => {
    // التحقق من صحة البيانات أولاً
    if (!doubtData.titleAr.trim() || !doubtData.category) {
      // استخدام إشعار من نوع "تحذير" للتحقق من صحة البيانات
      addNotification(t('validationErrorAlert'), 'warning');
      return;
    }
    
    setIsSaving(true);
    try {
      const newDoubt = await createDoubt(doubtData);
      // استخدام إشعار من نوع "نجاح"
      addNotification(t('createSuccessAlert'), 'success');
      router.push(`/dashboard/doubts/edit/${newDoubt.id}`);
    } catch (error) {
      console.error("Failed to create doubt:", error);
      const apiError = error as ApiError;
      // عرض رسالة الخطأ من الـ API إن وجدت، وإلا عرض رسالة عامة
      const errorMessage = apiError.response?.data?.message || t('createErrorAlert');
      // استخدام إشعار من نوع "خطأ"
      addNotification(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
};

  const isFormValid = doubtData.titleAr.trim() && doubtData.category;

  return (
<RouteGuard allowedRoles={['Researcher', 'Admin', 'SuperAdmin']}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      
      <header className="mb-10">
        <div className={`flex flex-col sm:flex-row justify-between items-start gap-4 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
          <div>
            <div className={`flex items-center gap-2 ${locale === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <h1 className="text-3xl font-bold text-gray-900">{t('pageTitle')}</h1>
                <LuFilePlus2 className="text-blue-600" size={28} />
            </div>
            <p className="mt-2 text-lg text-gray-600">{t('pageSubtitle')}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        <main className="lg:col-span-2 space-y-8">
          <FormSection icon={<FaInfoCircle size={20} />} title={t('basicInfoTitle')}>
            <FormField label={t('mainTitleLabel')}>
              <input name="titleAr" type="text" value={doubtData.titleAr} onChange={handleChange} placeholder={t('mainTitlePlaceholder')} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg"/>
            </FormField>
            
            <FormField label={t('categoryLabel')}>
              <div className="relative">
                <select name="category" value={doubtData.category} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg font-semibold text-gray-800 appearance-none cursor-pointer">
                  <option value="" disabled>{t('categoryPlaceholder')}</option>
                  {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>))}
                </select>
                <div className={`absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex items-center ${locale === 'ar' ? 'left-3' : 'right-3'}`}>
                  <FaChevronDown />
                </div>
              </div>
            </FormField>

            <FormField label={t('summaryLabel')}>
              <textarea name="summaryAr" rows={4} value={doubtData.summaryAr} onChange={handleChange} placeholder={t('summaryPlaceholder')} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg"/>
            </FormField>
            
            <FormField label={t('englishSectionLabel')}>
              <div className="space-y-2">
                <input name="titleEn" type="text" value={doubtData.titleEn} onChange={handleChange} placeholder={t('englishTitlePlaceholder')} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg"/>
                <textarea name="summaryEn" rows={2} value={doubtData.summaryEn} onChange={handleChange} placeholder={t('englishSummaryPlaceholder')} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg"/>
              </div>
            </FormField>
          </FormSection>

          <FormSection icon={<FaBolt size={20} />} title={t('quickReplyTitle')} isLocked={true} />
          <FormSection icon={<FaListUl size={20} />} title={t('detailedRebuttalTitle')} isLocked={true} />
          <FormSection icon={<FaBookOpen size={20} />} title={t('sourcesTitle')} isLocked={true} />
        </main>

        <aside className="lg:col-span-1">
          <div className={`sticky top-8 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
            <h3 className="text-xl font-bold text-gray-800 mb-4">{t('actionsTitle')}</h3>
            <div className="space-y-3">
              <button onClick={handleCreateDoubt} disabled={isSaving || !isFormValid} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold">
                {isSaving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                <span>{isSaving ? t('creatingButton') : t('createButton')}</span>
              </button>
              <p className="text-xs text-gray-500 text-center pt-2">{t('redirectNotice')}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
    </RouteGuard>
  );    

}
