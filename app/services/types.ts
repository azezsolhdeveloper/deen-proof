// ====================================================================
// 1. الأنواع الأساسية (Entities)
// تمثل الكيانات الأساسية في النظام.
// ====================================================================

export interface Source {
  id: number;
  nameAr: string;
  nameEn?: string; // الاسم الإنجليزي اختياري
  url?: string | null;
}

export interface Claim {
  id: number;
  claimAr: string;
  claimEn: string;
  responseAr: string;
  responseEn: string;
  sources: Source[];
}

export interface Comment {
  id: number;
  content: string;
  section: string | null;
  createdAt: string;
  authorName: string;
}

export interface AddCommentPayload {
  content: string;
  section: string;
}
export interface LockResponse {
  message: string;
  lockedAt: string; // التواريخ تأتي كسلاسل نصية من JSON
  lockedBy: number;
}

export interface UnlockResponse {
  message: string;
}

// ====================================================================
// 2. أنواع لوحة التحكم (Dashboard)
// ====================================================================

/**
 * نوع مختصر للردود عند عرضها في قائمة لوحة التحكم.
 */
export interface DoubtSummary {
  id: number;
  titleAr: string;
  authorName: string;
  status: string;
  createdAt: string;
}

/**
 * النوع المفصل للرد عند عرضه في صفحة التعديل.
 */
export interface DoubtDetail {
  id: number;
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  quickReplyAr: string | null;
  quickReplyEn: string | null;
  status: string;
  category: string;
  slug: string;
  authorName: string;
  detailedRebuttal: Claim[];
  mainSources: Source[];
  comments: Comment[];
}

/**
 * نوع المهام التي تظهر في لوحة الكانبان (Kanban).
 */
export interface Submission {
  id: number;
  // title: string; // ❌ أزل السطر القديم
  titleAr: string; // ✅ أضف هذا السطر
  titleEn: string; // ✅ أضف هذا السطر
  authorName: string;
  authorImage: string;
  status: string;
  submittedAt: string;
  commentCount: number;
}

/**
 * نوع بيانات الإحصائيات في لوحة التحكم.
 */
export interface StatSummary {
  // إحصائيات المدير والمشرف العام
  totalDoubts?: number;
  pendingReview?: number;
  published?: number;
  needsRevision?: number;
  totalLikes?: number; // ✅ 1. أضف السطر هنا

  // إحصائيات الباحث
  myDrafts?: number;
  myRevisions?: number;
}

export interface ActivityLog {
  id: number;
  // action: string; // ❌ أزل السطر القديم
  actionKey: string; // ✅ أضف هذا السطر
  timestamp: string;
  userName: string;
  doubtTitleAr: string;
  doubtTitleEn: string;
}

export interface ReviewTask {
  id: number;
  titleAr: string;
  titleEn?: string;
  authorName: string;
  updatedAt: string;
  status: string; // ✅✅✅ أضف هذا السطر المهم ✅✅✅
}
export interface FeedbackSubmission {
  id: number;
  message: string;
  contactInfo?: string;
  isRead: boolean;
  submittedAt: string;
  doubtId: number;
  doubtTitle: string;
  doubtSlug: string;
  doubtLikeCount: number;
  doubtCategory: string;
}
export interface User {
    id: number;
    name: string;
    email: string;
    role: 'Researcher' | 'Reviewer' | 'Admin' | 'SuperAdmin';
    createdAt: string;
    isOwner?: boolean;
}
/**
 * نوع شامل يجمع كل بيانات الصفحة الرئيسية للوحة التحكم.
 */
export interface DashboardData {
  stats: StatSummary;
  recentActivities: ActivityLog[];
  myTasks: ReviewTask[];
}

// ====================================================================
// 3. أنواع الحمولة (API Payloads)
// الأنواع التي يتم إرسالها إلى الواجهة الخلفية.
// ====================================================================

export interface LoginPayload {
    email: string;
    password: string;
}

export interface CreateDoubtPayload {
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  category: string;
}

export interface UpdateDoubtPayload {
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  quickReplyAr: string | null;
  quickReplyEn: string | null;
  category: string;
  slug: string;
  mainSources: Source[];
}

export interface AddClaimPayload {
  claimAr: string;
  claimEn: string;
  responseAr: string;
  responseEn: string;
  sourceIds?: number[];
}

export interface CreateUserPayload {
    name: string;
    email: string;
    password?: string;
    role: string;
}

export interface UpdateUserPayload {
  name: string;
  email: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

// ====================================================================
// 4. أنواع واجهة الزوار (Public Interface)
// ====================================================================
// app/services/types.ts
export interface PublicDoubt {
  id: number;
  slug: string;
  category: string;
  titleAr: string;   // ✅ تأكد من وجود هذا
  titleEn: string;   // ✅ تأكد من وجود هذا
  summaryAr: string; // ✅ تأكد من وجود هذا
  summaryEn: string; // ✅ تأكد من وجود هذا
  publishedAt: string;
}
export interface PaginatedResult<T> {
  items: T[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface PublicDoubtDetail {
  id: number;
  slug: string;
  category: string;
  authorName: string;
    reviewerName?: string; // ✅ اسم المراجع اختياري

  publishedAt: string;
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  quickReplyAr: string | null;
  quickReplyEn: string | null;
    viewCount: number; // ✅
  likeCount: number; // ✅
  // الردود التفصيلية باللغتين
  detailedRebuttal: {
    id: number;
    claimAr: string;
    claimEn: string;
    responseAr: string;
    responseEn: string;
    // ✅ استبدلنا any بنوع Source الذي عرفته في بداية الملف
    sources?: Source[]; 
  }[];
  // المصادر الأساسية
  mainSources: {
  id: number;
  nameAr: string;
  nameEn?: string;
  url: string | null;
}[];
}
export interface MyDoubt {
  id: number;
  titleAr: string;
  titleEn?: string;
  status: string;
  updatedAt: string;
}
// ====================================================================
// 5. الأنواع العامة (General & Error Types)
// ====================================================================
// هذا يخبر TypeScript أننا نتوقع كائنًا قد يحتوي على خاصية `message`.
interface ApiErrorData {
  message?: string;
  // إذا كانت هناك خصائص أخرى محتملة في بيانات الخطأ، يمكن إضافتها هنا.
  // باستخدام `unknown`، نحن نلزم أنفسنا بالتحقق من النوع إذا أردنا استخدام خصائص أخرى.
  [key: string]: unknown;
}

// --- ✅ 2. استخدام النوع الجديد في ApiError ---
export interface ApiError {
  response?: {
    // الآن، `data` له نوع محدد وهو `ApiErrorData` بدلاً من كائن عشوائي.
    data?: ApiErrorData;
  };
  message: string; // للتعامل مع أخطاء الشبكة العامة
}
export interface UpdateUserDto {
  name: string;
  email: string;
  role: 'Researcher' | 'Reviewer' | 'Admin' | 'SuperAdmin';
  password?: string;
}