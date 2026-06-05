export interface PipelineProgram {
  id: string;
  compound: string;
  condition: string;
  modality: string;
  stage: 'Preclinical' | 'Phase I' | 'Phase II' | 'Phase III' | 'FDA Review';
  highlight: boolean;
  slug?: string;
  summary?: string;
  description?: string;
  status?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  bio: string;
  initials: string;
}

export interface JobListing {
  id: string;
  title: string;
  location: string;
  department: string;
  slug?: string;
  summary?: string;
  description?: string;
  status?: string;
}

export interface NewsItem {
  id: string;
  date: string;
  headline: string;
  body: string;
  slug?: string;
  excerpt?: string;
  status?: string;
}

export interface OfficeLocation {
  city: string;
  address: string[];
  email?: string;
}

export type RoleCode = 'admin' | 'staff' | 'external';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  roleCode: RoleCode;
  roleName: string;
  userType: 'internal' | 'external';
  status: string;
  emailVerifiedAt: string | null;
  phoneNumber: string;
  title: string;
  avatarUrl: string;
  mustSetPassword: boolean;
  lastLoginAt: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface PortalDashboardSummary {
  applicationCounts: Record<string, number>;
  inquiryCounts: Record<string, number>;
  recentApplications: Record<string, unknown>[];
  recentInquiries: Record<string, unknown>[];
}

export interface StaffDashboardSummary {
  counts: Record<string, Record<string, number>>;
  recent: {
    articles: Record<string, unknown>[];
    pipelinePrograms: Record<string, unknown>[];
    teamProfiles: Record<string, unknown>[];
    jobPostings: Record<string, unknown>[];
  };
}

export interface AdminDashboardSummary {
  users: Record<string, number>;
  sessions: Record<string, number>;
  content: Record<string, Record<string, number>>;
  workflows: {
    jobApplications: Record<string, number>;
    inquiries: Record<string, number>;
  };
  recentApplications: Record<string, unknown>[];
  recentInquiries: Record<string, unknown>[];
  recentAuditLogs: Record<string, unknown>[];
}

export interface ArticlePayload {
  slug?: string;
  category: 'news' | 'knowledge';
  visibility?: 'public' | 'internal';
  status?: 'draft' | 'published' | 'archived';
  title: string;
  excerpt?: string;
  body: string;
  tags?: string[];
  coverImageUrl?: string;
}

export interface PipelineProgramPayload {
  slug?: string;
  compound: string;
  condition: string;
  modality: string;
  stage: 'Preclinical' | 'Phase I' | 'Phase II' | 'Phase III' | 'FDA Review';
  highlight?: boolean;
  summary?: string;
  description?: string;
  status?: 'draft' | 'published' | 'archived';
}

export interface TeamProfilePayload {
  slug?: string;
  name: string;
  title: string;
  bio: string;
  initials: string;
  displayOrder?: number;
  imageUrl?: string;
  status?: 'draft' | 'published' | 'archived';
  linkedUserId?: string | null;
}

export interface JobPostingPayload {
  slug?: string;
  title: string;
  department: string;
  location: string;
  summary?: string;
  description: string;
  requirements?: string[];
  benefits?: string[];
  status?: 'draft' | 'published' | 'closed' | 'archived';
}

export interface UserPayload {
  email: string;
  fullName: string;
  title?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  roleCode?: 'staff' | 'admin';
  userType?: 'internal';
}

export interface RolePayload {
  code: string;
  name: string;
  description?: string;
}

export interface JobApplicationPayload {
  userId?: string;
  jobPostingId: string;
  resumeUrl?: string;
  coverLetter?: string;
  status?: 'submitted' | 'under_review' | 'accepted' | 'rejected';
  adminNotes?: string;
}

export interface InquiryPayload {
  source?: 'public' | 'portal';
  userId?: string | null;
  fullName: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  adminNotes?: string;
}
