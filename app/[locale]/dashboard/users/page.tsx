'use client';
import RouteGuard from '../../../components/RouteGuard';
import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useTranslations, useLocale } from 'next-intl';
import { getUsers, createUser, deleteUser, updateUser } from '../../../services/api';
import { User, CreateUserPayload, UpdateUserDto, ApiError } from '../../../services/types';
import { FaPlus, FaPen, FaTrash, FaUserShield, FaUserEdit, FaUserGraduate, FaSpinner, FaChevronDown } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../../context/NotificationContext';
import ConfirmationModal from '../../../components/ConfirmationModal';
const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
);

const FormField = ({ label, children }: { label: string, children: React.ReactNode }) => {
    const locale = useLocale();
    return (
        <div>
            <label className={`block text-sm font-semibold text-gray-600 mb-2 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{label}</label>
            {children}
        </div>
    );
};

type RoleKey = 'role_SuperAdmin' | 'role_Admin' | 'role_Reviewer' | 'role_Researcher';

const RoleBadge = ({ role }: { role: string }) => {
    const t = useTranslations('UsersPage');
    const roleStyles: { [key: string]: { color: string; icon: React.ElementType } } = {
        SuperAdmin: { color: 'text-red-700 bg-red-100', icon: FaUserShield },
        Admin: { color: 'text-purple-700 bg-purple-100', icon: FaUserShield },
        Reviewer: { color: 'text-blue-700 bg-blue-100', icon: FaUserEdit },
        Researcher: { color: 'text-green-700 bg-green-100', icon: FaUserGraduate },
    };
    const style = roleStyles[role] || roleStyles.Researcher;
    const Icon = style.icon;
    const roleKey: RoleKey = `role_${role}` as RoleKey;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${style.color}`}>
            <Icon />
            {t(roleKey)}
        </span>
    );
};

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState<UpdateUserDto>({ name: '', email: '', role: 'Researcher', password: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const t = useTranslations('UsersPage');
    const locale = useLocale();
    const { user: currentUser } = useAuth();
const { addNotification } = useNotification();
const [confirmation, setConfirmation] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; } | null>(null);
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
    setIsLoading(true);
    try {
        const data = await getUsers();
        setUsers(data);
    } catch (err) {
        setError(t('loadingError'));
        // استخدام إشعار من نوع "خطأ"
        addNotification(t('loadingError'), 'error');
    } finally {
        setIsLoading(false);
    }
};


    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        setModalData({ name: '', email: '', role: 'Researcher', password: '' });
    };

    const openModal = (userToEdit: User | null = null) => {
        if (userToEdit) {
            setEditingUser(userToEdit);
            setModalData({ name: userToEdit.name, email: userToEdit.email, role: userToEdit.role, password: '' });
        } else {
            setEditingUser(null);
            setModalData({ name: '', email: '', role: 'Researcher', password: '' });
        }
        setIsModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setModalData((prev: UpdateUserDto) => ({ ...prev, [name]: value }));
    };

    const handleSaveUser = async () => {
    if (!modalData.name || !modalData.email || !modalData.role) {
        // إشعار تحذير للتحقق من صحة البيانات
        addNotification(t('validationError'), 'warning');
        return;
    }
    setIsSaving(true);
    try {
        if (editingUser) {
            await updateUser(editingUser.id, modalData);
        } else {
            if (!modalData.password) {
                // إشعار تحذير لكلمة المرور المطلوبة
                addNotification(t('passwordRequired'), 'warning');
                setIsSaving(false);
                return;
            }
            await createUser(modalData as CreateUserPayload);
        }
        // إشعار نجاح
        addNotification(t('saveSuccess'), 'success');
        await fetchUsers();
        closeModal();
    } catch (err) {
        const apiError = err as ApiError;
        const errorMessage = apiError.response?.data?.message || t('saveError');
        // إشعار خطأ
        addNotification(errorMessage, 'error');
    } finally {
        setIsSaving(false);
    }
};


    const handleDeleteUser = async (userId: number) => {
    setConfirmation({
        isOpen: true,
        title: t('deleteConfirmTitle'),
        message: t('deleteConfirmMessage'),
        onConfirm: async () => {
            try {
                await deleteUser(userId);
                // إزالة المستخدم من الحالة المحلية لتحديث الواجهة فورًا
                setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
                addNotification(t('deleteSuccess'), 'success');
            } catch (err) {
                const apiError = err as ApiError;
                const errorMessage = apiError.response?.data?.message || t('deleteError');
                addNotification(errorMessage, 'error');
            }
            setConfirmation(null); // أغلق النافذة بعد الانتهاء
        }
    });
};


    const getAvailableRoles = () => {
        if (currentUser?.isOwner) return ['Researcher', 'Reviewer', 'Admin', 'SuperAdmin'];
        if (currentUser?.role === 'SuperAdmin') return ['Researcher', 'Reviewer', 'Admin'];
        if (currentUser?.role === 'Admin') return ['Researcher', 'Reviewer'];
        return [];
    };

    return (
        <RouteGuard allowedRoles={['Admin', 'SuperAdmin']}>
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
                <Dialog as="div" className="relative z-50" onClose={closeModal}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                                    <Dialog.Title as="h3" className={`text-lg font-bold leading-6 text-gray-900 mb-4 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                        {editingUser ? t('editModalTitle') : t('addModalTitle')}
                                    </Dialog.Title>
                                    <div className="mt-4 space-y-4">
                                        <FormField label={t('nameLabel')}>
                                            <input name="name" type="text" value={modalData.name} onChange={handleInputChange} className={`w-full p-3 bg-gray-50 border border-gray-300 rounded-lg ${locale === 'ar' ? 'text-right' : 'text-left'}`} />
                                        </FormField>
                                        <FormField label={t('emailLabel')}>
                                            <input name="email" type="email" value={modalData.email} onChange={handleInputChange} className={`w-full p-3 bg-gray-50 border border-gray-300 rounded-lg ${locale === 'ar' ? 'text-right' : 'text-left'}`} />
                                        </FormField>
                                        <FormField label={t('roleLabel')}>
                                            <div className="relative">
                                                <select name="role" value={modalData.role} onChange={handleInputChange} className={`w-full p-3 bg-gray-50 border border-gray-300 rounded-lg appearance-none ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                    <option value="" disabled>{t('selectRolePlaceholder')}</option>
                                                    {getAvailableRoles().map(role => {
                                                        const roleKey: RoleKey = `role_${role}` as RoleKey;
                                                        return <option key={role} value={role}>{t(roleKey)}</option>
                                                    })}
                                                </select>
                                                <FaChevronDown className={`absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ${locale === 'ar' ? 'right-3' : 'left-3'}`} />
                                            </div>
                                        </FormField>
                                        <FormField label={editingUser ? t('newPasswordLabel') : t('passwordLabel')}>
                                            <input name="password" type="password" value={modalData.password} onChange={handleInputChange} className={`w-full p-3 bg-gray-50 border border-gray-300 rounded-lg ${locale === 'ar' ? 'text-right' : 'text-left'}`} placeholder={editingUser ? t('passwordPlaceholder') : ''} />
                                        </FormField>
                                    </div>
                                    <div className={`mt-6 flex gap-2 ${locale === 'ar' ? 'justify-end' : 'justify-start'}`}>
                                        <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md">{t('cancelButton')}</button>
                                        <button type="button" onClick={handleSaveUser} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md flex items-center gap-2">
                                            {isSaving && <FaSpinner className="animate-spin" />}
                                            {isSaving ? t('savingButton') : (editingUser ? t('saveChangesButton') : t('addUserButton'))}
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                <header className="mb-10">
                    <div className={`flex flex-col sm:flex-row justify-between items-start gap-4 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{t('pageTitle')}</h1>
                            <p className="mt-2 text-lg text-gray-600">{t('pageSubtitle')}</p>
                        </div>
                        {(currentUser?.role === 'Admin' || currentUser?.role === 'SuperAdmin') && (
                            <button onClick={() => openModal()} className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold">
                                <FaPlus /> {t('addNewMember')}
                            </button>
                        )}
                    </div>
                </header>

                {isLoading ? <LoadingSpinner /> : error ? (
                    <div className="py-20 text-center bg-red-50 text-red-700 rounded-lg">{error}</div>
                ) : (
                    <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
                        <table className={`w-full text-sm text-gray-500 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">{t('userColumn')}</th>
                                    <th scope="col" className="px-6 py-3 hidden md:table-cell">{t('roleColumn')}</th>
                                    <th scope="col" className="px-6 py-3 hidden lg:table-cell">{t('joinDateColumn')}</th>
                                    <th scope="col" className="px-6 py-3"><span className="sr-only">{t('actionsColumn')}</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {users.map((user) => {
                                        const isRowForSuperAdmin = user.role === 'SuperAdmin';
                                        const canCurrentUserEdit = currentUser?.isOwner || (currentUser?.role === 'SuperAdmin' && !isRowForSuperAdmin) || (currentUser?.role === 'Admin' && !isRowForSuperAdmin && user.role !== 'Admin');
                                        const canCurrentUserDelete = (currentUser?.isOwner && user.id !== 0) || (currentUser?.role === 'SuperAdmin' && !isRowForSuperAdmin) || (currentUser?.role === 'Admin' && !isRowForSuperAdmin && user.role !== 'Admin');

                                        return (
                                            <motion.tr key={user.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 flex-shrink-0">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold">{user.name}</div>
                                                            <div className="font-normal text-gray-500">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 hidden md:table-cell"><RoleBadge role={user.role} /></td>
                                                <td className="px-6 py-4 hidden lg:table-cell">{new Date(user.createdAt).toLocaleDateString(locale)}</td>
                                                <td className="px-6 py-4">
                                                    <div className={`flex items-center gap-2 ${locale === 'ar' ? 'justify-end' : 'justify-start'}`}>
                                                        {canCurrentUserEdit ? (
                                                            <button onClick={() => openModal(user)} className="p-2 text-gray-500 hover:text-blue-600"><FaPen /></button>
                                                        ) : (
                                                            <span className="p-2 text-gray-300 cursor-not-allowed" title={t('cannotEditSuperAdmin')}><FaPen /></span>
                                                        )}
                                                        
                                                        {canCurrentUserDelete ? (
                                                            <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-gray-500 hover:text-red-600"><FaTrash /></button>
                                                        ) : (
                                                            <span className="p-2 text-gray-300 cursor-not-allowed" title={t('cannotDeleteSuperAdmin')}><FaTrash /></span>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </RouteGuard>
    );
}
