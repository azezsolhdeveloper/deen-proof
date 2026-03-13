import api from './authToken'; 
import { 
  DoubtSummary,
  DoubtDetail,
  CreateDoubtPayload, 
  UpdateDoubtPayload, 
  User,
  CreateUserPayload,      // ✅✅✅ أضف هذا السطر مرة أخرى
  UpdateUserPayload,      // ✅✅✅ وأضف هذا السطر مرة أخرى
  ChangePasswordPayload,
  LoginPayload,
  Submission,
  DashboardData,
  Claim,
  Source,
  PublicDoubt,
  PublicDoubtDetail,
  PaginatedResult,
   Comment,
  AddCommentPayload
} from './types';
import { FeedbackSubmission } from './types'; // ✅ استيراد النوع الجديد


// ====================================================================
//  API لوحة التحكم (Dashboard API)
// ====================================================================

// --- عمليات الردود (Doubts) ---

export const getDoubts = async (): Promise<DoubtSummary[]> => {
  const response = await api.get('/doubts');
  return response.data;
};

export const getDoubtById = async (id: number | string): Promise<DoubtDetail> => {
  const response = await api.get(`/doubts/${id}`);
  return response.data;
};

export const createDoubt = async (doubtData: CreateDoubtPayload): Promise<{ id: number }> => {
  const response = await api.post('/doubts', doubtData);
  return response.data;
};

export const updateDoubt = async (id: number | string, doubtData: UpdateDoubtPayload): Promise<void> => {
  await api.put(`/doubts/${id}`, doubtData);
};

export const updateDoubtStatus = async (id: number | string, newStatus: string): Promise<void> => {
  await api.post(`/doubts/${id}/status`, { newStatus });
};

export const deleteDoubt = async (id: number | string): Promise<void> => {
  await api.delete(`/doubts/${id}`);
};

// --- عمليات الادعاءات (Claims) ---

export const addClaimToDoubt = async (doubtId: string | number, claimData: Partial<Claim>): Promise<Claim> => {
  const response = await api.post(`/doubts/${doubtId}/claims`, claimData);
  return response.data;
};

export const updateClaim = async (claimId: number, claimData: Partial<Claim>): Promise<void> => {
  await api.put(`/claims/${claimId}`, claimData);
};

export const deleteClaim = async (claimId: number): Promise<void> => {
  await api.delete(`/doubts/claims/${claimId}`);
};
export const addComment = async (doubtId: number | string, payload: AddCommentPayload): Promise<Comment> => {
  const response = await api.post(`/doubts/${doubtId}/comments`, payload);
  return response.data;
};

// --- عمليات المستخدمين (Users) ---

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get('/users');
  return response.data;
};

export const createUser = async (userData: CreateUserPayload): Promise<User> => {
  const response = await api.post('/users', userData);
  return response.data;
};

export const deleteUser = async (userId: number): Promise<void> => {
  await api.delete(`/users/${userId}`);
};
export async function updateFeedbackStatus(id: number, isRead: boolean): Promise<void> {
  await api.post(`/dashboard/feedback/${id}/status`, { isRead });
}
export const updateUser = async (id: number, userData: CreateUserPayload): Promise<void> => {
  await api.put(`/users/${id}`, userData);
};
// --- عمليات المستخدم الحالي والمصادقة ---

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/users/me');
  return response.data;
};

export const updateCurrentUser = async (data: UpdateUserPayload): Promise<void> => {
  await api.put('/users/me', data);
};

export const changeCurrentUserPassword = async (data: ChangePasswordPayload): Promise<void> => {
  await api.put('/users/me/password', data);
};

export const login = async (credentials: LoginPayload): Promise<{ token: string }> => {
  const response = await api.post('/users/login', credentials);
  return response.data;
};

// --- عمليات المراجعات ---
export async function getDoubtsForResearch() {
  // نستدعي الـ Endpoint الجديدة التي أنشأناها
  const response = await api.get('/doubts/research'); 
  return response.data;
}

// ✅ دالة جديدة لجلب الشبهات الخاصة بالمراجع
export async function getDoubtsForReview() {
  // نستدعي الـ Endpoint الجديدة التي أنشأناها
  const response = await api.get('/doubts/review');
  return response.data;
}

export const getDashboardData = async (): Promise<DashboardData> => {
  const response = await api.get('/dashboard/summary'); 
  return response.data;
};

export async function getFeedbackSubmissions(): Promise<FeedbackSubmission[]> { // ✅ استخدام النوع الصحيح
  const response = await api.get('/dashboard/feedback');
  return response.data;
}

// ====================================================================
//  API الزوار (Public API)
// ====================================================================

/**
 * جلب قائمة الردود المنشورة، مع إمكانية الفلترة حسب التصنيف.
 * @param category - (اختياري) اسم التصنيف للفلترة.
 * @returns قائمة بالردود المنشورة.
 */
export const getPublishedDoubts = async (category?: string): Promise<PublicDoubt[]> => {
    const url = category ? `/public/doubts?category=${category}` : '/public/doubts';
    const response = await api.get<PublicDoubt[]>(url);
    return response.data;
};


export const getPaginatedPublishedDoubts = async (category?: string, pageNumber: number = 1): Promise<PaginatedResult<PublicDoubt>> => {
    let url = `/public/doubts/paginated?pageNumber=${pageNumber}`; // ‼️ استخدام المسار الجديد ‼️
    if (category) {
        url += `&category=${category}`;
    }
    const response = await api.get<PaginatedResult<PublicDoubt>>(url);
    return response.data;
};
/**
 * جلب *كل* الردود المنشورة في مصفوفة واحدة، بدون ترقيم.
 * @returns مصفوفة تحتوي على كل الردود المنشورة.
 */
export const getAllPublishedDoubts = async (): Promise<PublicDoubt[]> => {
    const response = await api.get<PublicDoubt[]>('/public/doubts/all');
    return response.data;
};
/**
 * جلب قائمة خفيفة جدًا من المسارات لتوليد الصفحات الثابتة.
 * @returns قائمة تحتوي فقط على slug و category.
 */
export const getStaticParamsForDoubts = async (): Promise<{ slug: string; category: string; }[]> => {
    const response = await api.get<{ slug: string; category: string; }[]>('/public/doubts/for-static-generation');
    return response.data;
};
/**
 * جلب التفاصيل الكاملة لرد واحد منشور باستخدام الـ Slug الخاص به.
 * @param slug - الـ Slug الفريد للرد.
 * @returns التفاصيل الكاملة للرد.
 */
export const getPublishedDoubtBySlug = async (slug: string): Promise<PublicDoubtDetail> => {
    const response = await api.get<PublicDoubtDetail>(`/public/doubts/${slug}`);
    return response.data;
};
/**
 * جلب إحصائيات بعدد الردود في كل تصنيف.
 * @returns قائمة بالتصنيفات وعدد الردود في كل منها.
 */
export const getCategoryStats = async (): Promise<{ category: string; count: number; }[]> => {
    const response = await api.get<{ category: string; count: number; }[]>('/public/category-stats');
    return response.data;
};


/**
 * البحث في الردود المنشورة باستخدام مصطلح بحث.
 * @param query - مصطلح البحث.
 * @param lang - لغة النتائج المطلوبة ('ar' أو 'en').
 * @returns قائمة بنتائج البحث المطابقة.
 */
export const searchPublicDoubts = async (query: string, lang: string): Promise<{ slug: string; category: string; title: string; summary: string; }[]> => {
    if (query.length < 3) {
        return [];
    }
    const response = await api.get(`/public/search?query=${encodeURIComponent(query)}&lang=${lang}`);
    return response.data;
};

/**
 * دالة خاصة لجلب البيانات المطلوبة لخريطة الموقع فقط.
 * تجلب كل الشبهات المنشورة مع الحد الأدنى من البيانات.
 * @returns قائمة بالشبهات تحتوي على slug, category, publishedAt.
 */
export const getAllPublishedDoubtsForSitemap = async (): Promise<{ slug: string; category: string; publishedAt: string; }[]> => {
    const response = await api.get('/public/doubts/for-sitemap'); // ‼️ سنحتاج إلى إنشاء هذه النقطة في الواجهة الخلفية ‼️
    return response.data;
};
/**
 * إرسال ملاحظة أو تصحيح بخصوص شبهة معينة.
 * @param feedbackData - البيانات التي تحتوي على id الشبهة والرسالة.
 * @returns رسالة تأكيد.
 */
export const submitFeedback = async (feedbackData: { doubtId: number; message: string; }): Promise<{ message: string }> => {
    const response = await api.post('/public/feedback', feedbackData);
    return response.data;
};

/**
 * زيادة عدد الإعجابات لشبهة معينة بمقدار واحد.
 * @param doubtId - الـ ID الخاص بالشبهة.
 * @returns العدد الجديد للإعجابات.
 */
export const recordLike = async (doubtId: number): Promise<{ newLikeCount: number }> => {
    const response = await api.post(`/public/doubts/${doubtId}/like`);
    return response.data;
};