'use client';

import React, { useState, Fragment, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '../../../../../../i18n/routing';
import { getDoubtById, updateDoubt, addClaimToDoubt, updateClaim, deleteClaim, updateDoubtStatus } from '../../../../../services/api';
import { DoubtDetail, Claim, Source } from '../../../../../services/types';
import { useAuth } from '../../../../../context/AuthContext';
import { FaPlus, FaSave, FaPaperPlane, FaTrash, FaPen, FaTimes, FaCheck, FaLock, FaSpinner, FaInfoCircle, FaBolt, FaListUl, FaBookOpen, FaChevronDown } from 'react-icons/fa';
import { Dialog, Transition } from '@headlessui/react';
import CommentsDisplay from '../../../../../components/CommentsDisplay'; // تأكد من أن المسار صحيح
import { useNotification } from '../../../../../context/NotificationContext';
import ConfirmationModal from '../../../../../components/ConfirmationModal';
import { ApiError } from '../../../../../services/types';
const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
);

const FormSection = ({ icon, title, children, actions, isLocked = false }: { icon: React.ReactNode, title: string, children: React.ReactNode, actions?: React.ReactNode, isLocked?: boolean }) => {
    const locale = useLocale();
    const t = useTranslations('EditDoubtPage');
    return (
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-sm">
            <div className={`flex items-center mb-6 ${locale === 'ar' ? 'justify-end flex-row-reverse' : 'justify-between'}`}>
                {actions}
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <div className="text-gray-500">{icon}</div>
                </div>
            </div>
            {isLocked ? (
                <div className="text-center py-10 px-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 font-medium">{t('lockedSectionMessage')}</p>
                    <p className="text-sm text-gray-400 mt-1">{t('lockedSectionSubMessage')}</p>
                </div>
            ) : children}
        </section>
    );
};

const FormField = ({ label, children }: { label: string, children: React.ReactNode }) => {
    const locale = useLocale();
    return (
        <div>
            <label className={`block text-sm font-semibold text-gray-600 mb-2 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{label}</label>
            {children}
        </div>
    );
};

const LanguageTabs = ({ activeTab, setActiveTab, children }: { activeTab: 'ar' | 'en', setActiveTab: (tab: 'ar' | 'en') => void, children: React.ReactNode[] }) => {
    const locale = useLocale();
    return (
        <div>
            <div className="border-b border-gray-200 mb-4">
                <nav className={`-mb-px flex gap-x-6 ${locale === 'ar' ? 'justify-end' : 'justify-start'}`} aria-label="Tabs">
                    <button onClick={() => setActiveTab('ar')} className={`${activeTab === 'ar' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}>العربية</button>
                    <button onClick={() => setActiveTab('en')} className={`${activeTab === 'en' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}>English</button>
                </nav>
            </div>
            <div>{activeTab === 'ar' ? children[0] : children[1]}</div>
        </div>
    );
};

type CategoryKey = 'category_quran' | 'category_prophet' | 'category_science' | 'category_history';
const categories = [
  { id: 'quran', key: 'category_quran' as CategoryKey },
  { id: 'prophet', key: 'category_prophet' as CategoryKey },
  { id: 'science', key: 'category_science' as CategoryKey },
  { id: 'history', key: 'category_history' as CategoryKey },
];

type StatusKey = 'status_Draft' | 'status_PendingReview' | 'status_PendingApproval' | 'status_NeedsRevision' | 'status_Published';

const initialClaimState: Claim = { id: 0, claimAr: '', claimEn: '', responseAr: '', responseEn: '', sources: [] };

export default function EditDoubtPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { user: currentUser } = useAuth();
    const t = useTranslations('EditDoubtPage');
    const locale = useLocale();
 const { addNotification } = useNotification();
    const [confirmation, setConfirmation] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; } | null>(null);

    const [doubt, setDoubt] = useState<DoubtDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingClaim, setEditingClaim] = useState<Claim | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mainLangTab, setMainLangTab] = useState<'ar' | 'en'>(locale as 'ar' | 'en');
    const [modalLangTab, setModalLangTab] = useState<'ar' | 'en'>(locale as 'ar' | 'en');
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!id) return;
        getDoubtById(id)
            .then(data => setDoubt(data))
            .catch(() => setError(t('loadingError')))
            .finally(() => setIsLoading(false));
    }, [id, t]);

    const isSuperAdmin = currentUser?.role === 'SuperAdmin';
    const isAdmin = currentUser?.role === 'Admin';
    const isOwner = doubt?.authorName === currentUser?.name;
    const isEditable = doubt ? (isOwner && (doubt.status === 'Draft' || doubt.status === 'NeedsRevision')) || isAdmin || isSuperAdmin : false;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setDoubt(prev => prev ? { ...prev, [e.target.name]: e.target.value } : null);
    };

    const openClaimModal = (claim: Claim | null) => {
        setEditingClaim(claim ? { ...claim } : initialClaimState);
        setIsModalOpen(true);
    };
    const closeClaimModal = () => setIsModalOpen(false);

    const handleClaimChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEditingClaim(prev => prev ? { ...prev, [e.target.name]: e.target.value } : null);
    };

    const handleSaveClaim = async () => {
    if (!editingClaim || !doubt) return;
    try {
        if (editingClaim.id === 0) {
            const newClaim = await addClaimToDoubt(doubt.id, editingClaim);
            setDoubt(prev => prev ? { ...prev, detailedRebuttal: [...prev.detailedRebuttal, newClaim] } : null);
        } else {
            await updateClaim(editingClaim.id, editingClaim);
            setDoubt(prev => prev ? { ...prev, detailedRebuttal: prev.detailedRebuttal.map(c => c.id === editingClaim.id ? editingClaim : c) } : null);
        }
        addNotification(t('saveClaimSuccess'), 'success');
        closeClaimModal();
    } catch (err) { 
        addNotification(t('saveClaimError'), 'error');
    }
};


    const handleDeleteClaim = async (claimId: number) => {
    setConfirmation({
        isOpen: true,
        title: t('deleteClaimConfirmTitle'),
        message: t('deleteClaimConfirmMessage'),
        onConfirm: async () => {
            try {
                await deleteClaim(claimId);
                setDoubt(prev => prev ? { ...prev, detailedRebuttal: prev.detailedRebuttal.filter(c => c.id !== claimId) } : null);
                addNotification(t('deleteClaimSuccess'), 'success');
            } catch (err) { 
                addNotification(t('deleteClaimError'), 'error');
            }
            setConfirmation(null);
        }
    });
};


   const handleClaimSourceChange = (index: number, field: keyof Source, value: string) => {
    if (!editingClaim) return;
    const newSources = [...editingClaim.sources];
    // تأكد من أن newSources[index] موجود قبل التعديل
    if (newSources[index]) {
        newSources[index] = { ...newSources[index], [field]: value };
        setEditingClaim({ ...editingClaim, sources: newSources });
    }
};
   const addClaimSource = () => {
    if (!editingClaim) return;
    // أضفنا nameAr كحقل أساسي. nameEn سيكون اختياريًا.
    setEditingClaim({ ...editingClaim, sources: [...editingClaim.sources, { id: 0, nameAr: '', url: '' }] });
};
    const removeClaimSource = (index: number) => {
        if (!editingClaim) return;
        setEditingClaim({ ...editingClaim, sources: editingClaim.sources.filter((_, i) => i !== index) });
    };

   const handleMainSourceChange = (index: number, field: keyof Source, value: string) => {
    if (!doubt) return;
    const newSources = [...doubt.mainSources];
    if (newSources[index]) {
        newSources[index] = { ...newSources[index], [field]: value };
        setDoubt({ ...doubt, mainSources: newSources });
    }
};
   const addMainSource = () => {
    if (!doubt) return;
    setDoubt({ ...doubt, mainSources: [...doubt.mainSources, { id: 0, nameAr: '', url: '' }] });
};
    const removeMainSource = (index: number) => {
        if (!doubt) return;
        setDoubt({ ...doubt, mainSources: doubt.mainSources.filter((_, i) => i !== index) });
    };

    const handleSaveDraft = async () => {
    if (!doubt) return;
    setIsSaving(true);
    try {
        await updateDoubt(id, doubt);
        addNotification(t('saveSuccess'), 'success');
    } catch (err) { 
        addNotification(t('saveError'), 'error');
    }
    finally { setIsSaving(false); }
};


   const handleStatusUpdate = (newStatus: 'PendingReview' | 'Published' | 'NeedsRevision') => {
    if (!doubt) return;
    const confirmMessageKey = newStatus === 'PendingReview' ? 'confirmSubmitReview' : newStatus === 'Published' ? 'confirmPublish' : 'confirmRequestRevision';
    
    setConfirmation({
        isOpen: true,
        title: t('confirmActionTitle'),
        message: t(confirmMessageKey),
        onConfirm: async () => {
            setIsSubmitting(true);
            try {
                await updateDoubtStatus(id, newStatus);
                setDoubt(prev => prev ? { ...prev, status: newStatus } : null);
                addNotification(t('statusUpdateSuccess'), 'success');
                if (newStatus === 'PendingReview') {
                    router.push('/dashboard');
                }
            } catch (err) { 
                // --- ✅ الإصلاح هنا ---
                // نخبر TypeScript أن الخطأ هو من نوع ApiError
                const apiError = err as ApiError;
                // الآن يمكننا الوصول إلى `message` بأمان
                const errorMessage = apiError.response?.data?.message || t('statusUpdateError');
                addNotification(errorMessage, 'error');
            }
            finally { 
                setIsSubmitting(false);
                setConfirmation(null);
            }
        }
    });
};

    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="py-20 text-center bg-red-50 text-red-700 rounded-lg">{error}</div>;
    if (!doubt) return <div className="text-center p-8">{t('notFound')}</div>;

    const currentStatusKey: StatusKey = `status_${doubt.status}` as StatusKey;
    const statusStyles: { [key: string]: string } = {
        Draft: 'bg-gray-100 text-gray-700',
        PendingReview: 'bg-yellow-100 text-yellow-700',
        PendingApproval: 'bg-blue-100 text-blue-700',
        NeedsRevision: 'bg-red-100 text-red-700',
        Published: 'bg-green-100 text-green-700',
    };
    const currentStatusStyle = statusStyles[doubt.status] || statusStyles.Draft;

    return (
        <>
        {confirmation && (
            <ConfirmationModal
                isOpen={confirmation.isOpen}
                title={confirmation.title}
                message={confirmation.message}
                onConfirm={confirmation.onConfirm}
                onCancel={() => setConfirmation(null)}
            />
        )}
            <Transition appear show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closeClaimModal}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className={`w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                    <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900 mb-4">
                                        {editingClaim?.id === 0 ? t('claimModalAddTitle') : t('claimModalEditTitle')}
                                    </Dialog.Title>
                                    <div className="mt-4 space-y-6">
                                        <LanguageTabs activeTab={modalLangTab} setActiveTab={setModalLangTab}>
                                            <div className="space-y-4">
                                                <FormField label={t('claimArLabel')}><input name="claimAr" value={editingClaim?.claimAr} onChange={handleClaimChange} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg" /></FormField>
                                                <FormField label={t('responseArLabel')}><textarea name="responseAr" value={editingClaim?.responseAr} onChange={handleClaimChange} rows={5} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg" /></FormField>
                                            </div>
                                            <div className="space-y-4">
                                                <FormField label={t('claimEnLabel')}><input name="claimEn" value={editingClaim?.claimEn} onChange={handleClaimChange} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg" /></FormField>
                                                <FormField label={t('responseEnLabel')}><textarea name="responseEn" value={editingClaim?.responseEn} onChange={handleClaimChange} rows={5} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg" /></FormField>
                                            </div>
                                        </LanguageTabs>
                                        <div>
                                            <h4 className="font-semibold text-gray-700 mb-3">{t('claimSourcesLabel')}</h4>
                                            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
                                                {editingClaim?.sources.map((source, index) => (
                                                    <div key={source.id || index} className="flex items-center gap-2">
                                                        <button onClick={() => removeClaimSource(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-md"><FaTrash /></button>
                                                        <input type="url" placeholder={t('urlPlaceholder')} value={source.url || ''} onChange={(e) => handleClaimSourceChange(index, 'url', e.target.value)} className="w-1/3 p-2 border border-gray-300 rounded-md text-sm" />
<div className="flex-grow grid grid-cols-2 gap-2">
    <input 
        type="text" 
        placeholder={t('sourceNameArPlaceholder')} // سنضيف هذا للترجمة
        value={source.nameAr} 
        onChange={(e) => handleClaimSourceChange(index, 'nameAr', e.target.value)} 
        className="w-full p-2 border border-gray-300 rounded-md text-sm" 
    />
    <input 
        type="text" 
        placeholder={t('sourceNameEnPlaceholder')} // سنضيف هذا للترجمة
        value={source.nameEn || ''} 
        onChange={(e) => handleClaimSourceChange(index, 'nameEn', e.target.value)} 
        className="w-full p-2 border border-gray-300 rounded-md text-sm" 
    />
</div>                                                    </div>
                                                ))}
                                                <button type="button" onClick={addClaimSource} className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 mt-2"><FaPlus /><span>{t('addClaimSourceButton')}</span></button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`mt-6 flex gap-2 ${locale === 'ar' ? 'justify-end' : 'justify-start'}`}>
                                        <button type="button" onClick={closeClaimModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">{t('cancelButton')}</button>
                                        <button type="button" onClick={handleSaveClaim} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">{t('saveButton')}</button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                <header className={`mb-10 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                    <h1 className="text-3xl font-bold text-gray-900">{t('pageTitle')}</h1>
                    <p className="mt-2 text-lg text-gray-600">{t('pageSubtitle')} <span className="font-semibold text-blue-600">{locale === 'ar' ? doubt.titleAr : (doubt.titleEn || doubt.titleAr)}</span></p>
                </header>
{doubt.comments && doubt.comments.length > 0 && (
        <CommentsDisplay comments={doubt.comments} />
    )}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <main className="lg:col-span-2 space-y-8">
                        <div className={!isEditable ? 'opacity-60 pointer-events-none' : ''}>
                            <FormSection icon={<FaInfoCircle size={20} />} title={t('basicInfoSection')}>
                                <LanguageTabs activeTab={mainLangTab} setActiveTab={setMainLangTab}>
                                    <div className="space-y-4">
                                        <FormField label={t('titleArLabel')}><input name="titleAr" value={doubt.titleAr} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg" /></FormField>
                                        <FormField label={t('summaryArLabel')}><textarea name="summaryAr" value={doubt.summaryAr} onChange={handleChange} rows={4} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg" /></FormField>
                                    </div>
                                    <div className="space-y-4">
                                        <FormField label={t('titleEnLabel')}><input name="titleEn" value={doubt.titleEn} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg" /></FormField>
                                        <FormField label={t('summaryEnLabel')}><textarea name="summaryEn" value={doubt.summaryEn} onChange={handleChange} rows={4} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg" /></FormField>
                                    </div>
                                </LanguageTabs>
                                <FormField label={t('categoryLabel')}>
                                    <div className="relative">
                                        <select name="category" value={doubt.category || ''} onChange={handleChange} className={`w-full p-3 bg-gray-50 border border-gray-300 rounded-lg appearance-none ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                            <option value="" disabled>{t('selectCategoryPlaceholder')}</option>
                                            {categories.map(cat => <option key={cat.id} value={cat.id}>{t(cat.key)}</option>)}
                                        </select>
                                        <FaChevronDown className={`absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ${locale === 'ar' ? 'left-3' : 'right-3'}`} />
                                    </div>
                                </FormField>
                            </FormSection>

                            <FormSection icon={<FaBolt size={20} />} title={t('quickReplySection')}>
                                <LanguageTabs activeTab={mainLangTab} setActiveTab={setMainLangTab}>
                                    <FormField label={t('quickReplyArLabel')}><textarea name="quickReplyAr" value={doubt.quickReplyAr || ''} onChange={handleChange} rows={5} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg" /></FormField>
                                    <FormField label={t('quickReplyEnLabel')}><textarea name="quickReplyEn" value={doubt.quickReplyEn || ''} onChange={handleChange} rows={5} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg" /></FormField>
                                </LanguageTabs>
                            </FormSection>
                        </div>

                        <FormSection 
                            icon={<FaListUl size={20} />} 
                            title={t('detailedRebuttalSection')}
                            actions={isEditable ? <button onClick={() => openClaimModal(null)} className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100"><FaPlus /> {t('addClaimButton')}</button> : undefined}
                        >
                            <div className="space-y-3">
                                {doubt.detailedRebuttal.length > 0 ? doubt.detailedRebuttal.map(claim => (
                                    <div key={claim.id} className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg border ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                        <p className="font-semibold text-gray-700 flex-grow">{locale === 'ar' ? claim.claimAr : (claim.claimEn || claim.claimAr)}</p>
                                        {isEditable && (
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <button onClick={() => openClaimModal(claim)} className="p-2 text-gray-400 hover:text-blue-600"><FaPen size={14} /></button>
                                                <button onClick={() => handleDeleteClaim(claim.id)} className="p-2 text-gray-400 hover:text-red-600"><FaTrash size={14} /></button>
                                            </div>
                                        )}
                                    </div>
                                )) : <p className="text-center text-gray-400 py-8">{t('noClaims')}</p>}
                            </div>
                        </FormSection>

                        <div className={!isEditable ? 'opacity-60 pointer-events-none' : ''}>
                            <FormSection icon={<FaBookOpen size={20} />} title={t('mainSourcesSection')}>
                                <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
                                    {doubt.mainSources.map((source, index) => (
                                        <div key={source.id || index} className="flex items-center gap-2">
                                            <button onClick={() => removeMainSource(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-md"><FaTrash /></button>
                                            <input type="url" placeholder={t('urlPlaceholder')} value={source.url || ''} onChange={(e) => handleMainSourceChange(index, 'url', e.target.value)} className="w-1/3 p-2 border border-gray-300 rounded-md text-sm" />
<div className="flex-grow grid grid-cols-2 gap-2">
    <input 
        type="text" 
        placeholder={t('sourceNameArPlaceholder')} 
        value={source.nameAr} 
        onChange={(e) => handleMainSourceChange(index, 'nameAr', e.target.value)} 
        className="w-full p-2 border border-gray-300 rounded-md text-sm" 
    />
    <input 
        type="text" 
        placeholder={t('sourceNameEnPlaceholder')} 
        value={source.nameEn || ''} 
        onChange={(e) => handleMainSourceChange(index, 'nameEn', e.target.value)} 
        className="w-full p-2 border border-gray-300 rounded-md text-sm" 
    />
</div>                                        </div>
                                    ))}
                                    <button type="button" onClick={addMainSource} className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 mt-2"><FaPlus /><span>{t('addMainSourceButton')}</span></button>
                                </div>
                            </FormSection>
                        </div>
                    </main>

                    <aside className="lg:col-span-1">
                        <div className="sticky top-8 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
                            <h3 className={`text-xl font-bold text-gray-800 mb-4 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('actionsSection')}</h3>
                            <div className={`space-y-3 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                <p className="text-sm text-gray-500">{t('statusLabel')} 
                                    <span className={`font-bold px-2 py-1 rounded-md ${currentStatusStyle}`}>
                                        {t(currentStatusKey)}
                                    </span>
                                </p>
                                
                                {!isEditable && (
                                    <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded-lg flex items-center gap-3">
                                        <FaLock /><span>{t('lockedMessage')}</span>
                                    </div>
                                )}

                                <button onClick={handleSaveDraft} disabled={!isEditable || isSaving} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed">
                                    {isSaving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                                    <span>{isSaving ? t('savingDraftButton') : t('saveDraftButton')}</span>
                                </button>
                                
                                {(isOwner && (doubt.status === 'Draft' || doubt.status === 'NeedsRevision')) && (
                                    <button onClick={() => handleStatusUpdate('PendingReview')} disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300">
                                        {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                                        <span>{isSubmitting ? t('submittingButton') : t('submitForReviewButton')}</span>
                                    </button>
                                )}

                                {(isAdmin || isSuperAdmin) && (
                                    <>
                                        <div className="border-t my-3"></div>
                                        <p className="text-xs text-gray-400 text-center">{t('adminActionsLabel')}</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button onClick={() => handleStatusUpdate('NeedsRevision')} disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 disabled:bg-red-300">
                                                <FaPen /> {t('requestRevisionButton')}
                                            </button>
                                            <button onClick={() => handleStatusUpdate('Published')} disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-300">
                                                <FaCheck /> {t('publishButton')}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
}
