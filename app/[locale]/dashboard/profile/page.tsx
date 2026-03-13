'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getCurrentUser, updateCurrentUser, changeCurrentUserPassword } from '../../../services/api';
import { User, UpdateUserPayload, ChangePasswordPayload, ApiError } from '../../../services/types';
import { FaSave } from 'react-icons/fa';
import { useNotification } from '../../../context/NotificationContext';

function SpinnerIcon() {
  return (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
   );
}

function isApiError(error: unknown): error is ApiError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error
    );
}

export default function ProfilePage() {
  const t = useTranslations('ProfilePage');
  const locale = useLocale();
  const { addNotification } = useNotification();
  const [user, setUser] = useState<UpdateUserPayload>({ name: '', email: '' });
  const [passwordData, setPasswordData] = useState<ChangePasswordPayload>({ currentPassword: '', newPassword: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser({ name: currentUser.name, email: currentUser.email });
      } catch (error) {
        // استبدال alert بإشعار
        addNotification(t('loadingError'), 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
}, [t, addNotification]); // <-- أضف addNotification إلى مصفوفة الاعتماديات


  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setPasswordData({ ...passwordData, [name]: value });
    }
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingInfo(true);
    try {
      await updateCurrentUser(user);
      // إشعار نجاح
      addNotification(t('updateSuccess'), 'success');
    } catch (error) {
        // إشعار خطأ
        addNotification(t('updateError'), 'error');
    } finally {
      setIsSavingInfo(false);
    }
};


  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== confirmPassword) {
      // إشعار تحذير لعدم تطابق كلمة المرور
      addNotification(t('passwordMismatchError'), 'warning');
      return;
    }
    setIsSavingPassword(true);
    try {
      await changeCurrentUserPassword(passwordData);
      // إشعار نجاح
      addNotification(t('passwordChangeSuccess'), 'success');
      setPasswordData({ currentPassword: '', newPassword: '' });
      setConfirmPassword('');
    } catch (error) {
        // منطق محسن للتعامل مع أخطاء الـ API
        const apiError = error as ApiError;
        const errorMessage = apiError.response?.data?.message || t('passwordChangeError');
        // إشعار خطأ
        addNotification(errorMessage, 'error');
    } finally {
      setIsSavingPassword(false);
    }
};


  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="mr-4 text-slate-600">{t('loadingMessage' )}</span>
        </div>
      );
  }

  return (
    <div className="p-4 sm:p-8 w-full" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto">
        <header className={`mb-12 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
          <h1 className="text-4xl font-black text-slate-800">{t('pageTitle')}</h1>
          <p className="text-slate-500 mt-2">{t('pageSubtitle')}</p>
        </header>

        <div className="space-y-12">
          <section className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className={`text-xl font-bold text-slate-700 mb-6 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('accountInfoSection')}</h2>
            <form onSubmit={handleSaveInfo} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className={`block text-sm font-bold text-slate-700 mb-2 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('nameLabel')}</label>
                  <input type="text" id="name" name="name" value={user.name} onChange={handleInfoChange} className={`w-full p-3 border border-slate-300 rounded-lg ${locale === 'ar' ? 'text-right' : 'text-left'}`} />
                </div>
                <div>
                  <label htmlFor="email" className={`block text-sm font-bold text-slate-700 mb-2 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('emailLabel')}</label>
                  <input type="email" id="email" name="email" value={user.email} onChange={handleInfoChange} className={`w-full p-3 border border-slate-300 rounded-lg ${locale === 'ar' ? 'text-right' : 'text-left'}`} />
                </div>
              </div>
              <div className={`flex ${locale === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <button type="submit" disabled={isSavingInfo} className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-blue-400">
                  {isSavingInfo && <SpinnerIcon />}
                  <span>{isSavingInfo ? t('savingButton') : t('saveChangesButton')}</span>
                </button>
              </div>
            </form>
          </section>

          <section className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className={`text-xl font-bold text-slate-700 mb-6 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('changePasswordSection')}</h2>
            <form onSubmit={handleSavePassword} className="space-y-6 max-w-md">
              <div>
                <label htmlFor="currentPassword" className={`block text-sm font-bold text-slate-700 mb-2 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('currentPasswordLabel')}</label>
                <input type="password" id="currentPassword" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required className={`w-full p-3 border border-slate-300 rounded-lg ${locale === 'ar' ? 'text-right' : 'text-left'}`} />
              </div>
              <div>
                <label htmlFor="newPassword" className={`block text-sm font-bold text-slate-700 mb-2 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('newPasswordLabel')}</label>
                <input type="password" id="newPassword" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required className={`w-full p-3 border border-slate-300 rounded-lg ${locale === 'ar' ? 'text-right' : 'text-left'}`} />
              </div>
              <div>
                <label htmlFor="confirmPassword" className={`block text-sm font-bold text-slate-700 mb-2 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('confirmPasswordLabel')}</label>
                <input type="password" id="confirmPassword" name="confirmPassword" value={confirmPassword} onChange={handlePasswordChange} required className={`w-full p-3 border border-slate-300 rounded-lg ${locale === 'ar' ? 'text-right' : 'text-left'}`} />
              </div>
              <div className={`flex ${locale === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <button type="submit" disabled={isSavingPassword} className="inline-flex items-center justify-center rounded-lg bg-slate-700 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:bg-slate-500">
                  {isSavingPassword && <SpinnerIcon />}
                  <span>{isSavingPassword ? t('changingPasswordButton') : t('changePasswordButton')}</span>
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
