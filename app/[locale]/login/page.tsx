'use client';

import React, { useState, useEffect } from 'react';
import { Link, usePathname } from '../../../i18n/routing';
import { useTranslations, useLocale } from 'next-intl';
import { login } from '../../services/api';
import { setAuthToken } from '../../services/authToken';
import { LoginPayload, ApiError } from '../../services/types';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationCircle } from 'react-icons/fa';

// --- مكونات مساعدة ---
function SpinnerIcon() {
  return (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    );
}

// --- ✅ 1. مكون إشعار بسيط ومؤقت خاص بصفحة تسجيل الدخول ---
function LoginErrorNotification({ message, onDismiss }: { message: string; onDismiss: () => void; }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="p-4 rounded-xl border-2 border-red-500/50 bg-white/80 backdrop-blur-lg flex items-center gap-4 text-red-800 shadow-2xl shadow-slate-500/10"
    >
      <div className="text-2xl"><FaExclamationCircle /></div>
      <p className="font-bold flex-grow">{message}</p>
      <button onClick={onDismiss} className="text-lg opacity-50 hover:opacity-100 transition-opacity">&times;</button>
    </motion.div>
  );
}

export default function LoginPage() {
  const [credentials, setCredentials] = useState<LoginPayload>({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const pathname = usePathname();
  const t = useTranslations('LoginPage');
  const locale = useLocale();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { token } = await login(credentials);
      localStorage.setItem('token', token);
      setAuthToken(token);
      window.location.href = `/${locale}/dashboard`;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      // ✅ 2. عرض رسالة الخطأ من الـ API إن وجدت
      const errorMessage = apiError.response?.data?.message || t('loginError');
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* --- ✅ 3. إضافة حاوية الإشعار في أعلى الصفحة --- */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md px-4">
        <AnimatePresence>
          {error && <LoginErrorNotification message={error} onDismiss={() => setError('')} />}
        </AnimatePresence>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 text-3xl font-[1000] text-slate-900 tracking-tighter">
            <span className="w-3 h-3 bg-blue-600 rounded-full" />
            DeenProof
          </Link>
          <p className="text-slate-500 mt-2">{t('pageTitle')}</p>
          <div className="mt-4">
            <Link 
              href={pathname}
              locale={locale === 'ar' ? 'en' : 'ar'}
              className="px-3 py-1.5 text-xs font-bold text-slate-500 bg-slate-100 rounded-full hover:bg-slate-200 hover:text-slate-700 transition-colors"
            >
              {locale === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
            </Link>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className={`block text-sm font-bold text-slate-700 mb-2 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('emailLabel')}</label>
              <input id="email" name="email" type="email" autoComplete="email" required value={credentials.email} onChange={handleChange} className={`w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${locale === 'ar' ? 'text-right' : 'text-left'}`} />
            </div>
            <div>
              <label htmlFor="password" className={`block text-sm font-bold text-slate-700 mb-2 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('passwordLabel')}</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required value={credentials.password} onChange={handleChange} className={`w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${locale === 'ar' ? 'text-right' : 'text-left'}`} />
            </div>
            
            {/* --- ✅ 4. إزالة رسالة الخطأ النصية القديمة --- */}
            {/* {error && (<p>...</p>)} */}

            <div>
              <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 disabled:bg-blue-400">
                {isLoading && <SpinnerIcon />}
                <span>{isLoading ? t('loggingInButton') : t('loginButton')}</span>
              </button>
            </div>
          </form>
        </div>
        
        <p className="mt-8 text-center text-sm text-slate-500">
          <Link href="/" className="font-medium text-blue-600 hover:underline">{t('backToHome')}</Link>
        </p>
      </div>
    </div>
  );
}
