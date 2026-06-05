import { ArticleModel } from "./article.model.js";
import { AuditLogModel } from "./audit-log.model.js";
import { ContactInquiryModel } from "./contact-inquiry.model.js";
import { ErrorLogModel } from "./error-log.model.js";
import { JobApplicationModel } from "./job-application.model.js";
import { JobPostingModel } from "./job-posting.model.js";
import { PipelineProgramModel } from "./pipeline-program.model.js";
import { RoleModel } from "./role.model.js";
import { SessionModel } from "./session.model.js";
import { TeamProfileModel } from "./team-profile.model.js";
import { UserModel } from "./user.model.js";

export {
  ArticleModel,
  AuditLogModel,
  ContactInquiryModel,
  ErrorLogModel,
  JobApplicationModel,
  JobPostingModel,
  PipelineProgramModel,
  RoleModel,
  SessionModel,
  TeamProfileModel,
  UserModel,
};

export const qmongoModels = {
  User: UserModel,
  Role: RoleModel,
  Session: SessionModel,
  Article: ArticleModel,
  PipelineProgram: PipelineProgramModel,
  TeamProfile: TeamProfileModel,
  JobPosting: JobPostingModel,
  JobApplication: JobApplicationModel,
  ContactInquiry: ContactInquiryModel,
  AuditLog: AuditLogModel,
};


