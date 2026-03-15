'use client';

import { Link, usePathname } from '../../i18n/routing';
import { useTranslations } from 'next-intl';
import { useAuth } from '../context/AuthContext';
import { FaTachometerAlt, FaPlus, FaList, FaUsers, FaSignOutAlt, FaUserCircle, FaInbox, FaSearch, FaBook } from 'react-icons/fa'; // ✅ أضف أيقونة الكتاب

type NavKey = 'home' | 'create' | 'review' | 'users' | 'feedback';

const allNavLinks = [
  { href: '/dashboard', key: 'home' as NavKey, icon: FaTachometerAlt, roles: ['Researcher', 'Reviewer', 'Admin', 'SuperAdmin'] },
  { href: '/dashboard/doubts/new', key: 'create' as NavKey, icon: FaPlus, roles: ['Researcher', 'Admin', 'SuperAdmin'] },
  { href: '/dashboard/review', key: 'review' as NavKey, icon: FaList, roles: ['Reviewer', 'Admin', 'SuperAdmin'] },
    { href: '/dashboard/search', key: 'search' as NavKey, icon: FaSearch, roles: ['Reviewer', 'Admin', 'SuperAdmin'] },
  { href: '/dashboard/my-library', key: 'myLibrary', icon: FaBook, roles: ['Researcher'] },

  { href: '/dashboard/users', key: 'users' as NavKey, icon: FaUsers, roles: ['Admin', 'SuperAdmin'] },
  { href: '/dashboard/feedback', key: 'feedback' as NavKey, icon: FaInbox, roles: ['Admin', 'SuperAdmin'] },
];

export default function DashboardNav() {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  const t = useTranslations('DashboardNav');

  // --- ✅✅✅ بداية كود التصحيح (Debugging) ✅✅✅ ---
  console.log('[DEBUG] DashboardNav: Rendering. isLoading:', isLoading, 'User:', user);
  // --- نهاية كود التصحيح ---

  if (isLoading || !user) {
    console.log('[DEBUG] DashboardNav: Not rendering because isLoading or no user.');
    return null;
  }

  const visibleLinks = allNavLinks.filter(link => link.roles.includes(user.role));
  console.log('[DEBUG] DashboardNav: Filtered visible links:', visibleLinks);

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 w-[95%] sm:w-auto transition-all duration-300">
      <div className="bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-full p-1.5 flex items-center justify-between gap-1 overflow-x-auto hide-scrollbar">
        
        <nav className="flex items-center gap-1">
          {visibleLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 py-2.5 px-5 rounded-full transition-all duration-300 text-sm font-bold ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <link.icon className={isActive ? 'text-white' : 'text-slate-400'} />
                <span className="hidden sm:block">{t(link.key)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="w-px h-8 bg-slate-200 mx-1"></div>

        <div className="flex items-center gap-1">
          <Link 
            href="/dashboard/profile"
            className="flex items-center justify-center w-10 h-10 text-sm font-bold text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 rounded-full transition-colors group"
            title={t('profileTitle')}
          >
            <FaUserCircle className="w-5 h-5" />
          </Link>

          <button 
            onClick={logout}
            className="flex items-center justify-center w-10 h-10 text-sm font-bold text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors group"
            title={t('logoutTitle')}
          >
            <FaSignOutAlt />
          </button>
        </div>

      </div>
    </div>
  );
}
