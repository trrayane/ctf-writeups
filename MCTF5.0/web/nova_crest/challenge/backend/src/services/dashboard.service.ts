import {
  ArticleModel,
  AuditLogModel,
  ContactInquiryModel,
  JobApplicationModel,
  JobPostingModel,
  PipelineProgramModel,
  SessionModel,
  TeamProfileModel,
  UserModel,
} from "../database/models/index.js";
import {
  CONTENT_STATUSES,
  INQUIRY_STATUSES,
  JOB_APPLICATION_STATUSES,
  JOB_POSTING_STATUSES,
  USER_STATUSES,
} from "../types/domain.types.js";

type StatusCounts<T extends readonly string[]> = Record<T[number], number> & {
  total: number;
};

async function getStatusCounts<T extends readonly string[]>(
  model: {
    countDocuments(filter?: Record<string, unknown>): Promise<number>;
  },
  statuses: T,
  filter: Record<string, unknown>,
): Promise<StatusCounts<T>> {
  const counts = Object.fromEntries(
    statuses.map((status) => [status, 0]),
  ) as Record<T[number], number>;

  const totals = await Promise.all(
    statuses.map((status) => model.countDocuments({ ...filter, status })),
  );

  const typedStatuses = statuses as readonly T[number][];

  typedStatuses.forEach((status, index) => {
    counts[status] = totals[index];
  });

  return {
    ...counts,
    total: totals.reduce((sum, count) => sum + count, 0),
  };
}

async function getContentCounts() {
  const baseFilter = { deletedAt: null };

  const [articles, pipelinePrograms, teamProfiles, jobPostings] = await Promise.all([
    getStatusCounts(ArticleModel, CONTENT_STATUSES, baseFilter),
    getStatusCounts(PipelineProgramModel, CONTENT_STATUSES, baseFilter),
    getStatusCounts(TeamProfileModel, CONTENT_STATUSES, baseFilter),
    getStatusCounts(JobPostingModel, JOB_POSTING_STATUSES, baseFilter),
  ]);

  return {
    articles,
    pipelinePrograms,
    teamProfiles,
    jobPostings,
  };
}

export async function getPortalDashboardSummary(userId: string) {
  const baseFilter = { userId, deletedAt: null };

  const [applicationCounts, inquiryCounts, recentApplications, recentInquiries] =
    await Promise.all([
      getStatusCounts(JobApplicationModel, JOB_APPLICATION_STATUSES, baseFilter),
      getStatusCounts(ContactInquiryModel, INQUIRY_STATUSES, baseFilter),
      JobApplicationModel.find(baseFilter)
        .populate("jobPostingId", "title slug location department status")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      ContactInquiryModel.find(baseFilter).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

  return {
    applicationCounts,
    inquiryCounts,
    recentApplications,
    recentInquiries,
  };
}

export async function getStaffDashboardSummary() {
  const baseFilter = { deletedAt: null };
  const contentCounts = await getContentCounts();

  const [articles, pipelinePrograms, teamProfiles, jobPostings] = await Promise.all([
    ArticleModel.find(baseFilter)
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("title slug status category updatedAt")
      .lean(),
    PipelineProgramModel.find(baseFilter)
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("compound slug status stage updatedAt")
      .lean(),
    TeamProfileModel.find(baseFilter)
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("name slug status title updatedAt")
      .lean(),
    JobPostingModel.find(baseFilter)
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("title slug status department location updatedAt")
      .lean(),
  ]);

  return {
    counts: contentCounts,
    recent: {
      articles,
      pipelinePrograms,
      teamProfiles,
      jobPostings,
    },
  };
}

export async function getAdminDashboardSummary() {
  const now = new Date();
  const baseFilter = { deletedAt: null };
  const contentCounts = await getContentCounts();

  const [
    userStatusCounts,
    internalUsers,
    externalUsers,
    totalSessions,
    activeSessions,
    revokedSessions,
    expiredSessions,
    jobApplicationCounts,
    inquiryCounts,
    recentApplications,
    recentInquiries,
    recentAuditLogs,
  ] = await Promise.all([
    getStatusCounts(UserModel, USER_STATUSES, baseFilter),
    UserModel.countDocuments({ ...baseFilter, userType: "internal" }),
    UserModel.countDocuments({ ...baseFilter, userType: "external" }),
    SessionModel.countDocuments({}),
    SessionModel.countDocuments({ revokedAt: null, expiresAt: { $gt: now } }),
    SessionModel.countDocuments({ revokedAt: { $ne: null } }),
    SessionModel.countDocuments({ revokedAt: null, expiresAt: { $lte: now } }),
    getStatusCounts(JobApplicationModel, JOB_APPLICATION_STATUSES, baseFilter),
    getStatusCounts(ContactInquiryModel, INQUIRY_STATUSES, baseFilter),
    JobApplicationModel.find(baseFilter)
      .populate("userId", "email fullName")
      .populate("jobPostingId", "title slug status")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    ContactInquiryModel.find(baseFilter)
      .populate("userId", "email fullName")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    AuditLogModel.find({})
      .populate("actorUserId", "email fullName")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  return {
    users: {
      ...userStatusCounts,
      internal: internalUsers,
      external: externalUsers,
      pendingVerification: userStatusCounts.pending_verification,
    },
    sessions: {
      total: totalSessions,
      active: activeSessions,
      revoked: revokedSessions,
      expired: expiredSessions,
    },
    content: contentCounts,
    workflows: {
      jobApplications: jobApplicationCounts,
      inquiries: inquiryCounts,
    },
    recentApplications,
    recentInquiries,
    recentAuditLogs,
  };
}
