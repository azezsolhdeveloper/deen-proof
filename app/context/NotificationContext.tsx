'use client';

import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// --- ✅ 1. استيراد أيقونة التحذير ---
import { FaCheckCircle, FaExclamationCircle, FaExclamationTriangle } from 'react-icons/fa';

// --- ✅ 2. إضافة 'warning' إلى أنواع الإشعارات ---
type NotificationType = 'success' | 'error' | 'warning';

interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}
interface NotificationContextType {
  addNotification: (message: string, type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationId = useRef(0);

  const addNotification = (message: string, type: NotificationType) => {
    const id = notificationId.current++;
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // --- ✅ 3. إضافة تصميم لنوع 'warning' ---
  const styles = {
    success: "bg-white/80 border-green-500/50 text-green-800",
    error: "bg-white/80 border-red-500/50 text-red-800",
    warning: "bg-white/80 border-yellow-500/50 text-yellow-800", // <-- الإضافة الجديدة
  };

  // --- ✅ 4. إضافة أيقونة لنوع 'warning' ---
  const icons = {
    success: <FaCheckCircle />,
    error: <FaExclamationCircle />,
    warning: <FaExclamationTriangle />, // <-- الإضافة الجديدة
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[200] space-y-3 w-full max-w-md px-4">
        <AnimatePresence>
          {notifications.map(notification => (
            <motion.div
              key={notification.id}
              layout
              initial={{ opacity: 0, y: -50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              className={`p-4 rounded-xl border-2 shadow-2xl shadow-slate-500/10 backdrop-blur-lg flex items-center gap-4 ${styles[notification.type]}`}
            >
              <div className="text-2xl">
                {/* استخدام كائن الأيقونات الجديد */}
                {icons[notification.type]}
              </div>
              <p className="font-bold flex-grow">{notification.message}</p>
              <button 
                onClick={() => removeNotification(notification.id)} 
                className="text-lg opacity-50 hover:opacity-100 transition-opacity"
              >
                &times;
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};
