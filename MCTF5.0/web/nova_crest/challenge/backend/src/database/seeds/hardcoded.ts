import { env } from "../../config/env.js";
import { faker } from "@faker-js/faker";
import {
  ArticleModel,
  AuditLogModel,
  ContactInquiryModel,
  JobApplicationModel,
  JobPostingModel,
  PipelineProgramModel,
  RoleModel,
  SessionModel,
  TeamProfileModel,
  UserModel,
} from "../models/index.js";
import { hashPassword } from "../../services/crypto.service.js";
import { createSlug } from "../../services/validation.service.js";

interface SeedContext {
  adminUserId: string;
  staffUserId: string;
  externalUserIds: string[];
}

interface PersonSeed {
  email: string;
  fullName: string;
  phoneNumber: string;
  title: string;
  avatarUrl: string;
  company: string;
}

interface SeedCatalog {
  staff: PersonSeed;
  externals: PersonSeed[];
  article: {
    slug: string;
    title: string;
    excerpt: string;
    body: string;
    tags: string[];
    coverImageUrl: string;
  };
  pipelineProgram: {
    slug: string;
    compound: string;
    condition: string;
    modality: string;
    stage: "Preclinical" | "Phase I" | "Phase II" | "Phase III" | "FDA Review";
    summary: string;
    description: string;
  };
  teamProfile: {
    slug: string;
    name: string;
    title: string;
    bio: string;
    initials: string;
    imageUrl: string;
  };
  jobPostings: Array<{
    slug: string;
    title: string;
    department: string;
    location: string;
    summary: string;
    description: string;
    requirements: string[];
    benefits: string[];
    status: "published" | "draft";
  }>;
  applications: Array<{
    resumeUrl: string;
    coverLetter: string;
    status: "submitted" | "under_review";
    adminNotes: string;
  }>;
  inquiries: {
    public: {
      fullName: string;
      email: string;
      company: string;
      subject: string;
      message: string;
      status: "open";
    };
    portal: {
      subject: string;
      message: string;
      status: "in_progress";
      adminNotes: string;
    };
  };
}

function normalizeEmailPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 18);
}

function generatePersonSeed(title: string): PersonSeed {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const email = `${normalizeEmailPart(firstName)}.${normalizeEmailPart(lastName)}${faker.number.int({ min: 10, max: 99 })}@${faker.helpers.arrayElement(["gmail.com", "outlook.com", "proton.me", "yahoo.com"])}`;

  return {
    email,
    fullName: `${firstName} ${lastName}`,
    phoneNumber: faker.phone.number({ style: "international" }),
    title,
    avatarUrl: faker.image.avatarGitHub(),
    company: faker.company.name(),
  };
}

function buildSeedCatalog(): SeedCatalog {
  const staff = generatePersonSeed("Clinical Operations Manager");
  const externals = [
    generatePersonSeed("Clinical Research Partner"),
    generatePersonSeed("Biotech Program Liaison"),
  ];

  const articleTitle = faker.helpers.arrayElement([
    "Precision Therapy Program Reports New Milestone",
    "Clinical Data Review Highlights Improved Outcomes",
    "Partnership Initiative Advances Rare Disease Research",
  ]);
  const pipelineCondition = faker.helpers.arrayElement([
    "Inherited retinal disorder",
    "Rare metabolic syndrome",
    "Pediatric neurodegenerative condition",
  ]);
  const pipelineModality = faker.helpers.arrayElement([
    "Gene editing",
    "RNA therapy",
    "Cell therapy",
  ]);

  const profileFirstName = faker.person.firstName();
  const profileLastName = faker.person.lastName();
  const teamName = `Dr. ${profileFirstName} ${profileLastName}`;

  return {
    staff,
    externals,
    article: {
      slug: createSlug(`${articleTitle} ${faker.number.int({ min: 100, max: 999 })}`),
      title: articleTitle,
      excerpt: faker.lorem.sentence(16),
      body: `${faker.lorem.paragraph(4)}\n\n${faker.lorem.paragraph(3)}`,
      tags: faker.helpers.arrayElements(["clinical", "research", "therapy", "pipeline", "science"], 3),
      coverImageUrl: faker.image.urlPicsumPhotos({ width: 1280, height: 720 }),
    },
    pipelineProgram: {
      slug: createSlug(`program ${faker.string.alphanumeric({ length: 4, casing: "upper" })} ${faker.number.int({ min: 10, max: 99 })}`),
      compound: `NVC-${faker.number.int({ min: 100, max: 999 })}`,
      condition: pipelineCondition,
      modality: pipelineModality,
      stage: faker.helpers.arrayElement(["Preclinical", "Phase I", "Phase II", "Phase III", "FDA Review"] as const),
      summary: faker.lorem.sentence(18),
      description: faker.lorem.paragraph(4),
    },
    teamProfile: {
      slug: createSlug(`${teamName} profile`),
      name: teamName,
      title: faker.helpers.arrayElement([
        "Vice President, Translational Medicine",
        "Director of Clinical Research",
        "Senior Principal Scientist",
      ]),
      bio: faker.lorem.paragraph(5),
      initials: `${profileFirstName[0] ?? "A"}${profileLastName[0] ?? "B"}`.toUpperCase(),
      imageUrl: faker.image.avatarGitHub(),
    },
    jobPostings: [
      {
        slug: createSlug(`senior data engineer ${faker.number.int({ min: 10, max: 99 })}`),
        title: "Senior Data Engineer",
        department: "Data Platform",
        location: faker.helpers.arrayElement(["Boston, MA", "New York, NY", "Remote (US)"]),
        summary: faker.lorem.sentence(16),
        description: faker.lorem.paragraph(4),
        requirements: ["TypeScript", "Distributed systems", "Data pipelines"],
        benefits: ["Comprehensive medical plan", "Hybrid work", "Learning stipend"],
        status: "published",
      },
      {
        slug: createSlug(`clinical trial analyst ${faker.number.int({ min: 10, max: 99 })}`),
        title: "Clinical Trial Analyst",
        department: "Clinical Operations",
        location: faker.helpers.arrayElement(["Cambridge, MA", "Basel, CH", "Remote (EMEA)"]),
        summary: faker.lorem.sentence(16),
        description: faker.lorem.paragraph(4),
        requirements: ["Clinical data management", "Protocol analysis"],
        benefits: ["Equity package", "Research conference budget"],
        status: "draft",
      },
    ],
    applications: [
      {
        resumeUrl: faker.internet.url(),
        coverLetter: faker.lorem.paragraph(3),
        status: "submitted",
        adminNotes: faker.lorem.sentence(8),
      },
      {
        resumeUrl: faker.internet.url(),
        coverLetter: faker.lorem.paragraph(3),
        status: "under_review",
        adminNotes: faker.lorem.sentence(10),
      },
    ],
    inquiries: {
      public: {
        fullName: faker.person.fullName(),
        email: `${normalizeEmailPart(faker.person.firstName())}.${normalizeEmailPart(faker.person.lastName())}${faker.number.int({ min: 10, max: 99 })}@${faker.helpers.arrayElement(["gmail.com", "outlook.com"])}`,
        company: faker.company.name(),
        subject: faker.helpers.arrayElement([
          "Question about ongoing research",
          "Partnership inquiry",
          "Information request",
        ]),
        message: faker.lorem.paragraph(3),
        status: "open",
      },
      portal: {
        subject: faker.helpers.arrayElement([
          "Update on submitted application",
          "Clarification on role expectations",
          "Follow-up regarding interview timeline",
        ]),
        message: faker.lorem.paragraph(3),
        status: "in_progress",
        adminNotes: faker.lorem.sentence(9),
      },
    },
  };
}

async function seedRoles(): Promise<void> {
  await Promise.all([
    RoleModel.updateOne(
      { _id: "0" },
      {
        $set: {
          code: "admin",
          name: "Administrator",
          description: "System administrator with full access",
          isSystem: true,
          deletedAt: null,
          deletedBy: null,
        },
      },
      { upsert: true },
    ),
    RoleModel.updateOne(
      { _id: "1" },
      {
        $set: {
          code: "staff",
          name: "Staff",
          description: "Internal staff account",
          isSystem: true,
          deletedAt: null,
          deletedBy: null,
        },
      },
      { upsert: true },
    ),
    RoleModel.updateOne(
      { _id: "2" },
      {
        $set: {
          code: "external",
          name: "External",
          description: "External portal user",
          isSystem: true,
          deletedAt: null,
          deletedBy: null,
        },
      },
      { upsert: true },
    ),
  ]);
}

async function seedUsers(catalog: SeedCatalog): Promise<SeedContext> {
  const [adminRole, staffRole, externalRole] = await Promise.all([
    RoleModel.findOne({ code: "admin", deletedAt: null }),
    RoleModel.findOne({ code: "staff", deletedAt: null }),
    RoleModel.findOne({ code: "external", deletedAt: null }),
  ]);

  if (!adminRole || !staffRole || !externalRole) {
    throw new Error("Required roles were not found while seeding users");
  }

  const staffPasswordHash = await hashPassword("WelcomeStaff!123");
  const externalPasswordHash = await hashPassword("WelcomePortal!123");

  const staff = catalog.staff;
  const [externalOne, externalTwo] = catalog.externals;

  await Promise.all([
    UserModel.updateOne(
      { email: staff.email },
      {
        $set: {
          fullName: staff.fullName,
          passwordHash: staffPasswordHash,
          roleId: staffRole.id,
          userType: "internal",
          status: "active",
          emailVerifiedAt: new Date(),
          phoneNumber: staff.phoneNumber,
          title: staff.title,
          avatarUrl: staff.avatarUrl,
          mustSetPassword: false,
          deletedAt: null,
          deletedBy: null,
        },
      },
      { upsert: true },
    ),
    UserModel.updateOne(
      { email: externalOne.email },
      {
        $set: {
          fullName: externalOne.fullName,
          passwordHash: externalPasswordHash,
          roleId: externalRole.id,
          userType: "external",
          status: "active",
          emailVerifiedAt: new Date(),
          phoneNumber: externalOne.phoneNumber,
          title: externalOne.title,
          avatarUrl: externalOne.avatarUrl,
          mustSetPassword: false,
          deletedAt: null,
          deletedBy: null,
        },
      },
      { upsert: true },
    ),
    UserModel.updateOne(
      { email: externalTwo.email },
      {
        $set: {
          fullName: externalTwo.fullName,
          passwordHash: externalPasswordHash,
          roleId: externalRole.id,
          userType: "external",
          status: "active",
          emailVerifiedAt: new Date(),
          phoneNumber: externalTwo.phoneNumber,
          title: externalTwo.title,
          avatarUrl: externalTwo.avatarUrl,
          mustSetPassword: false,
          deletedAt: null,
          deletedBy: null,
        },
      },
      { upsert: true },
    ),
  ]);

  const [adminUser, staffUser, externalUser1, externalUser2] = await Promise.all([
    UserModel.findOne({ email: env.seedAdminEmail, deletedAt: null }),
    UserModel.findOne({ email: staff.email, deletedAt: null }),
    UserModel.findOne({ email: externalOne.email, deletedAt: null }),
    UserModel.findOne({ email: externalTwo.email, deletedAt: null }),
  ]);

  if (!adminUser || !staffUser || !externalUser1 || !externalUser2) {
    throw new Error("Seed users are missing after upsert");
  }

  return {
    adminUserId: adminUser.id,
    staffUserId: staffUser.id,
    externalUserIds: [externalUser1.id, externalUser2.id],
  };
}

async function seedSessions(context: SeedContext): Promise<void> {
  const [staffUserId, externalUserId] = [context.staffUserId, context.externalUserIds[0]];

  await Promise.all([
    SessionModel.updateOne(
      { userId: staffUserId, refreshTokenHash: `staff-${faker.string.alphanumeric(32)}` },
      {
        $set: {
          userAgent: faker.internet.userAgent(),
          ipAddress: faker.internet.ip(),
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          revokedAt: null,
          lastUsedAt: new Date(),
        },
      },
      { upsert: true },
    ),
    SessionModel.updateOne(
      { userId: externalUserId, refreshTokenHash: `external-${faker.string.alphanumeric(32)}` },
      {
        $set: {
          userAgent: faker.internet.userAgent(),
          ipAddress: faker.internet.ip(),
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          revokedAt: null,
          lastUsedAt: new Date(),
        },
      },
      { upsert: true },
    ),
  ]);
}

async function seedContent(context: SeedContext, catalog: SeedCatalog): Promise<string[]> {
  const authorId = context.staffUserId;

  const article = catalog.article;
  const program = catalog.pipelineProgram;
  const profile = catalog.teamProfile;
  const [publishedPosting, draftPosting] = catalog.jobPostings;

  await Promise.all([
    ArticleModel.updateOne(
      { slug: article.slug },
      {
        $set: {
          category: "news",
          visibility: "public",
          status: "published",
          title: article.title,
          excerpt: article.excerpt,
          body: article.body,
          tags: article.tags,
          coverImageUrl: article.coverImageUrl,
          authorId,
          publishedAt: new Date(),
          deletedAt: null,
          deletedBy: null,
        },
      },
      { upsert: true },
    ),
    PipelineProgramModel.updateOne(
      { slug: program.slug },
      {
        $set: {
          compound: program.compound,
          condition: program.condition,
          modality: program.modality,
          stage: program.stage,
          highlight: true,
          summary: program.summary,
          description: program.description,
          status: "published",
          authorId,
          publishedAt: new Date(),
          deletedAt: null,
          deletedBy: null,
        },
      },
      { upsert: true },
    ),
    TeamProfileModel.updateOne(
      { slug: profile.slug },
      {
        $set: {
          name: profile.name,
          title: profile.title,
          bio: profile.bio,
          initials: profile.initials,
          displayOrder: 1,
          imageUrl: profile.imageUrl,
          status: "published",
          linkedUserId: null,
          authorId,
          deletedAt: null,
          deletedBy: null,
        },
      },
      { upsert: true },
    ),
  ]);

  await Promise.all([
    JobPostingModel.updateOne(
      { slug: publishedPosting.slug },
      {
        $set: {
          title: publishedPosting.title,
          department: publishedPosting.department,
          location: publishedPosting.location,
          summary: publishedPosting.summary,
          description: publishedPosting.description,
          requirements: publishedPosting.requirements,
          benefits: publishedPosting.benefits,
          status: publishedPosting.status,
          authorId,
          publishedAt: new Date(),
          deletedAt: null,
          deletedBy: null,
        },
      },
      { upsert: true },
    ),
    JobPostingModel.updateOne(
      { slug: draftPosting.slug },
      {
        $set: {
          title: draftPosting.title,
          department: draftPosting.department,
          location: draftPosting.location,
          summary: draftPosting.summary,
          description: draftPosting.description,
          requirements: draftPosting.requirements,
          benefits: draftPosting.benefits,
          status: draftPosting.status,
          authorId,
          publishedAt: null,
          deletedAt: null,
          deletedBy: null,
        },
      },
      { upsert: true },
    ),
  ]);

  const postings = await JobPostingModel.find({
    slug: { $in: [publishedPosting.slug, draftPosting.slug] },
    deletedAt: null,
  })
    .sort({ slug: 1 })
    .lean();

  return postings.map((posting) => posting._id.toString());
}

async function seedWorkflow(context: SeedContext, catalog: SeedCatalog): Promise<void> {
  const publishedPosting = await JobPostingModel.findOne({
    slug: catalog.jobPostings[0]?.slug,
    deletedAt: null,
  }).lean();

  if (!publishedPosting) {
    throw new Error("Published seed job posting is missing");
  }

  await Promise.all([
    JobApplicationModel.updateOne(
      {
        userId: context.externalUserIds[0],
        jobPostingId: publishedPosting._id,
      },
      {
        $set: {
          resumeUrl: catalog.applications[0]?.resumeUrl,
          coverLetter: catalog.applications[0]?.coverLetter,
          status: catalog.applications[0]?.status,
          adminNotes: catalog.applications[0]?.adminNotes,
          deletedAt: null,
          deletedBy: null,
        },
      },
      { upsert: true },
    ),
    JobApplicationModel.updateOne(
      {
        userId: context.externalUserIds[1],
        jobPostingId: publishedPosting._id,
      },
      {
        $set: {
          resumeUrl: catalog.applications[1]?.resumeUrl,
          coverLetter: catalog.applications[1]?.coverLetter,
          status: catalog.applications[1]?.status,
          adminNotes: catalog.applications[1]?.adminNotes,
          deletedAt: null,
          deletedBy: null,
        },
      },
      { upsert: true },
    ),
    ContactInquiryModel.updateOne(
      {
        source: "public",
        email: catalog.inquiries.public.email,
        subject: catalog.inquiries.public.subject,
      },
      {
        $set: {
          userId: null,
          fullName: catalog.inquiries.public.fullName,
          company: catalog.inquiries.public.company,
          message: catalog.inquiries.public.message,
          status: catalog.inquiries.public.status,
          adminNotes: "",
          deletedAt: null,
          deletedBy: null,
        },
      },
      { upsert: true },
    ),
    ContactInquiryModel.updateOne(
      {
        source: "portal",
        email: catalog.externals[0]?.email,
        subject: catalog.inquiries.portal.subject,
      },
      {
        $set: {
          userId: context.externalUserIds[0],
          fullName: catalog.externals[0]?.fullName,
          company: catalog.externals[0]?.company,
          message: catalog.inquiries.portal.message,
          status: catalog.inquiries.portal.status,
          adminNotes: catalog.inquiries.portal.adminNotes,
          deletedAt: null,
          deletedBy: null,
        },
      },
      { upsert: true },
    ),
  ]);
}

async function seedAuditLogs(context: SeedContext): Promise<void> {
  await Promise.all([
    AuditLogModel.updateOne(
      {
        action: "admin.publish_article",
        entityType: "Article",
        entityId: "content-feed",
        route: "/api/admin/articles",
      },
      {
        $set: {
          actorUserId: context.adminUserId,
          roleSnapshot: "admin",
          method: "POST",
          metadata: { channel: "dashboard" },
          ipAddress: "127.0.0.1",
          userAgent: "Mozilla/5.0",
        },
      },
      { upsert: true },
    ),
    AuditLogModel.updateOne(
      {
        action: "admin.review_application",
        entityType: "JobApplication",
        entityId: "applications-batch",
        route: "/api/admin/job-applications",
      },
      {
        $set: {
          actorUserId: context.adminUserId,
          roleSnapshot: "admin",
          method: "PATCH",
          metadata: { channel: "dashboard" },
          ipAddress: "127.0.0.1",
          userAgent: "Mozilla/5.0",
        },
      },
      { upsert: true },
    ),
  ]);
}

export async function runHardcodedSeeds(): Promise<void> {
  faker.seed(env.seedFakerSeed);
  const catalog = buildSeedCatalog();

  await seedRoles();
  const context = await seedUsers(catalog);
  await seedSessions(context);
  await seedContent(context, catalog);
  await seedWorkflow(context, catalog);
  await seedAuditLogs(context);
}
