'use client';

import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import DashboardNav from '../../components/DashboardNav';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F8FAFC]">
        <div className="relative flex items-center justify-center">
           {/* تأثير تحميل عصري */}
          <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
          <div className="w-12 h-12 border-4 border-transparent border-t-blue-600 border-r-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      {/* استخدام لون خلفية فاتح جداً لتبرز عليه بطاقات البينتو */}
      <div className="flex flex-col min-h-screen bg-[#F8FAFC] font-sans">
        <Header />
        
        <div className="relative flex flex-col flex-1 pt-28 pb-12"> 
          {/* شريط التنقل أصبح عائماً لذا لا يأخذ مساحة ثابتة في الـ DOM العادي، لذلك زدنا الـ pt-28 */}
          <DashboardNav />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            {children}
          </main>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}