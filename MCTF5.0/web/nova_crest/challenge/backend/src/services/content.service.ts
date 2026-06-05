import type { Request } from "express";
import {
  ArticleModel,
  JobPostingModel,
  PipelineProgramModel,
  TeamProfileModel,
} from "../database/models/index.js";
import {
  ARTICLE_CATEGORIES,
  CONTENT_STATUSES,
  CONTENT_VISIBILITIES,
  JOB_POSTING_STATUSES,
  PIPELINE_STAGES,
} from "../types/domain.types.js";
import { createAuditLog, getRequestIp, getRequestUserAgent } from "./audit-log.service.js";
import { AppError } from "./app-error.js";
import {
  createSlug,
  optionalBoolean,
  optionalEnum,
  optionalNumber,
  optionalObjectId,
  optionalString,
  optionalStringArray,
  optionalUrl,
  parsePagination,
  requireEnum,
  requireObjectId,
  requireString,
} from "./validation.service.js";

export type CmsResourceKey =
  | "articles"
  | "pipeline-programs"
  | "team-profiles"
  | "job-postings";

interface ContentListResult {
  items: unknown[];
  total: number;
  page: number;
  limit: number;
}

interface ContentDocumentShape {
  id: string;
  deletedAt: Date | null;
  deletedBy: unknown;
  save(): Promise<unknown>;
  set(path: string, value: unknown): void;
  set(update: Record<string, unknown>): void;
}

interface ContentResourceConfig {
  entityType: string;
  searchFields: string[];
  defaultSort: Record<string, 1 | -1>;
  list: (
    filter: Record<string, unknown>,
    pagination: { skip: number; limit: number },
  ) => Promise<unknown[]>;
  count: (filter: Record<string, unknown>) => Promise<number>;
  findOneLean: (filter: Record<string, unknown>) => Promise<unknown | null>;
  findOneDocument: (
    filter: Record<string, unknown>,
  ) => Promise<ContentDocumentShape | null>;
  createRecord: (
    input: Record<string, unknown>,
  ) => Promise<ContentDocumentShape>;
  buildCreateInput: (
    payload: Record<string, unknown>,
    actorUserId: string,
  ) => Promise<Record<string, unknown>>;
  buildUpdateInput: (
    payload: Record<string, unknown>,
  ) => Promise<Record<string, unknown>>;
  applyQueryFilters: (
    filter: Record<string, unknown>,
    query: Record<string, unknown>,
    isPublic: boolean,
  ) => void;
}

function normalizePublishedAt(status: string | undefined): Date | null | undefined {
  if (status === undefined) {
    return undefined;
  }

  return status === "published" ? new Date() : null;
}

async function buildArticleCreateInput(
  payload: Record<string, unknown>,
  actorUserId: string,
) {
  const title = requireString(payload.title, "title");
  const status = optionalEnum(payload.status, "status", CONTENT_STATUSES) ?? "draft";

  return {
    slug: createSlug(optionalString(payload.slug, "slug") || title),
    category: requireEnum(payload.category, "category", ARTICLE_CATEGORIES),
    visibility:
      optionalEnum(payload.visibility, "visibility", CONTENT_VISIBILITIES) ?? "public",
    status,
    title,
    excerpt: optionalString(payload.excerpt, "excerpt"),
    body: requireString(payload.body, "body"),
    tags: optionalStringArray(payload.tags, "tags"),
    coverImageUrl: optionalUrl(payload.coverImageUrl, "coverImageUrl"),
    authorId: actorUserId,
    publishedAt: normalizePublishedAt(status) ?? null,
  };
}

async function buildArticleUpdateInput(payload: Record<string, unknown>) {
  const update: Record<string, unknown> = {};

  if (payload.slug !== undefined) update.slug = createSlug(requireString(payload.slug, "slug"));
  if (payload.category !== undefined) {
    update.category = requireEnum(payload.category, "category", ARTICLE_CATEGORIES);
  }
  if (payload.visibility !== undefined) {
    update.visibility = requireEnum(payload.visibility, "visibility", CONTENT_VISIBILITIES);
  }
  if (payload.status !== undefined) {
    const status = requireEnum(payload.status, "status", CONTENT_STATUSES);
    update.status = status;
    update.publishedAt = normalizePublishedAt(status) ?? null;
  }
  if (payload.title !== undefined) update.title = requireString(payload.title, "title");
  if (payload.excerpt !== undefined) update.excerpt = optionalString(payload.excerpt, "excerpt");
  if (payload.body !== undefined) update.body = requireString(payload.body, "body");
  if (payload.tags !== undefined) update.tags = optionalStringArray(payload.tags, "tags");
  if (payload.coverImageUrl !== undefined) {
    update.coverImageUrl = optionalUrl(payload.coverImageUrl, "coverImageUrl");
  }

  return update;
}

async function buildPipelineCreateInput(
  payload: Record<string, unknown>,
  actorUserId: string,
) {
  const compound = requireString(payload.compound, "compound");
  const status = optionalEnum(payload.status, "status", CONTENT_STATUSES) ?? "draft";

  return {
    slug: createSlug(optionalString(payload.slug, "slug") || compound),
    compound,
    condition: requireString(payload.condition, "condition"),
    modality: requireString(payload.modality, "modality"),
    stage: requireEnum(payload.stage, "stage", PIPELINE_STAGES),
    highlight: optionalBoolean(payload.highlight, "highlight") ?? false,
    summary: optionalString(payload.summary, "summary"),
    description: optionalString(payload.description, "description"),
    status,
    authorId: actorUserId,
    publishedAt: normalizePublishedAt(status) ?? null,
  };
}

async function buildPipelineUpdateInput(payload: Record<string, unknown>) {
  const update: Record<string, unknown> = {};

  if (payload.slug !== undefined) update.slug = createSlug(requireString(payload.slug, "slug"));
  if (payload.compound !== undefined) {
    update.compound = requireString(payload.compound, "compound");
  }
  if (payload.condition !== undefined) {
    update.condition = requireString(payload.condition, "condition");
  }
  if (payload.modality !== undefined) {
    update.modality = requireString(payload.modality, "modality");
  }
  if (payload.stage !== undefined) {
    update.stage = requireEnum(payload.stage, "stage", PIPELINE_STAGES);
  }
  if (payload.highlight !== undefined) {
    update.highlight = optionalBoolean(payload.highlight, "highlight") ?? false;
  }
  if (payload.summary !== undefined) update.summary = optionalString(payload.summary, "summary");
  if (payload.description !== undefined) {
    update.description = optionalString(payload.description, "description");
  }
  if (payload.status !== undefined) {
    const status = requireEnum(payload.status, "status", CONTENT_STATUSES);
    update.status = status;
    update.publishedAt = normalizePublishedAt(status) ?? null;
  }

  return update;
}

async function buildTeamProfileCreateInput(
  payload: Record<string, unknown>,
  actorUserId: string,
) {
  const name = requireString(payload.name, "name");

  return {
    slug: createSlug(optionalString(payload.slug, "slug") || name),
    name,
    title: requireString(payload.title, "title"),
    bio: requireString(payload.bio, "bio"),
    initials: requireString(payload.initials, "initials").toUpperCase(),
    displayOrder: optionalNumber(payload.displayOrder, "displayOrder") ?? 0,
    imageUrl: optionalUrl(payload.imageUrl, "imageUrl"),
    status: optionalEnum(payload.status, "status", CONTENT_STATUSES) ?? "draft",
    linkedUserId: optionalObjectId(payload.linkedUserId, "linkedUserId") ?? null,
    authorId: actorUserId,
  };
}

async function buildTeamProfileUpdateInput(payload: Record<string, unknown>) {
  const update: Record<string, unknown> = {};

  if (payload.slug !== undefined) update.slug = createSlug(requireString(payload.slug, "slug"));
  if (payload.name !== undefined) update.name = requireString(payload.name, "name");
  if (payload.title !== undefined) update.title = requireString(payload.title, "title");
  if (payload.bio !== undefined) update.bio = requireString(payload.bio, "bio");
  if (payload.initials !== undefined) {
    update.initials = requireString(payload.initials, "initials").toUpperCase();
  }
  if (payload.displayOrder !== undefined) {
    update.displayOrder = optionalNumber(payload.displayOrder, "displayOrder") ?? 0;
  }
  if (payload.imageUrl !== undefined) {
    update.imageUrl = optionalUrl(payload.imageUrl, "imageUrl");
  }
  if (payload.status !== undefined) {
    update.status = requireEnum(payload.status, "status", CONTENT_STATUSES);
  }
  if (payload.linkedUserId !== undefined) {
    update.linkedUserId = optionalObjectId(payload.linkedUserId, "linkedUserId") ?? null;
  }

  return update;
}

async function buildJobPostingCreateInput(
  payload: Record<string, unknown>,
  actorUserId: string,
) {
  const title = requireString(payload.title, "title");
  const status =
    optionalEnum(payload.status, "status", JOB_POSTING_STATUSES) ?? "draft";

  return {
    slug: createSlug(optionalString(payload.slug, "slug") || title),
    title,
    department: requireString(payload.department, "department"),
    location: requireString(payload.location, "location"),
    summary: optionalString(payload.summary, "summary"),
    description: requireString(payload.description, "description"),
    requirements: optionalStringArray(payload.requirements, "requirements"),
    benefits: optionalStringArray(payload.benefits, "benefits"),
    status,
    authorId: actorUserId,
    publishedAt: status === "published" ? new Date() : null,
  };
}

async function buildJobPostingUpdateInput(payload: Record<string, unknown>) {
  const update: Record<string, unknown> = {};

  if (payload.slug !== undefined) update.slug = createSlug(requireString(payload.slug, "slug"));
  if (payload.title !== undefined) update.title = requireString(payload.title, "title");
  if (payload.department !== undefined) {
    update.department = requireString(payload.department, "department");
  }
  if (payload.location !== undefined) {
    update.location = requireString(payload.location, "location");
  }
  if (payload.summary !== undefined) update.summary = optionalString(payload.summary, "summary");
  if (payload.description !== undefined) {
    update.description = requireString(payload.description, "description");
  }
  if (payload.requirements !== undefined) {
    update.requirements = optionalStringArray(payload.requirements, "requirements");
  }
  if (payload.benefits !== undefined) {
    update.benefits = optionalStringArray(payload.benefits, "benefits");
  }
  if (payload.status !== undefined) {
    const status = requireEnum(payload.status, "status", JOB_POSTING_STATUSES);
    update.status = status;
    update.publishedAt = status === "published" ? new Date() : null;
  }

  return update;
}

const resourceConfigMap: Record<CmsResourceKey, ContentResourceConfig> = {
  articles: {
    entityType: "Article",
    searchFields: ["title", "excerpt", "body"],
    defaultSort: { publishedAt: -1, createdAt: -1 },
    list(filter, pagination) {
      return ArticleModel.find(filter)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean();
    },
    count(filter) {
      return ArticleModel.countDocuments(filter);
    },
    findOneLean(filter) {
      return ArticleModel.findOne(filter).lean();
    },
    findOneDocument(filter) {
      return ArticleModel.findOne(filter) as unknown as Promise<
        ContentDocumentShape | null
      >;
    },
    createRecord(input) {
      return ArticleModel.create(input) as unknown as Promise<ContentDocumentShape>;
    },
    buildCreateInput: buildArticleCreateInput,
    buildUpdateInput: buildArticleUpdateInput,
    applyQueryFilters(filter, query, isPublic) {
      if (isPublic) {
        filter.status = "published";
        filter.visibility = "public";
      } else if (query.status) {
        filter.status = requireEnum(query.status, "status", CONTENT_STATUSES);
      }

      if (query.category) {
        filter.category = requireEnum(query.category, "category", ARTICLE_CATEGORIES);
      }

      if (!isPublic && query.visibility) {
        filter.visibility = requireEnum(
          query.visibility,
          "visibility",
          CONTENT_VISIBILITIES,
        );
      }
    },
  },
  "pipeline-programs": {
    entityType: "PipelineProgram",
    searchFields: ["compound", "condition", "modality", "summary"],
    defaultSort: { highlight: -1, createdAt: -1 },
    list(filter, pagination) {
      return PipelineProgramModel.find(filter)
        .sort({ highlight: -1, createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean();
    },
    count(filter) {
      return PipelineProgramModel.countDocuments(filter);
    },
    findOneLean(filter) {
      return PipelineProgramModel.findOne(filter).lean();
    },
    findOneDocument(filter) {
      return PipelineProgramModel.findOne(filter) as unknown as Promise<
        ContentDocumentShape | null
      >;
    },
    createRecord(input) {
      return PipelineProgramModel.create(input) as unknown as Promise<
        ContentDocumentShape
      >;
    },
    buildCreateInput: buildPipelineCreateInput,
    buildUpdateInput: buildPipelineUpdateInput,
    applyQueryFilters(filter, query, isPublic) {
      if (isPublic) {
        filter.status = "published";
      } else if (query.status) {
        filter.status = requireEnum(query.status, "status", CONTENT_STATUSES);
      }

      if (query.stage) {
        filter.stage = requireEnum(query.stage, "stage", PIPELINE_STAGES);
      }
    },
  },
  "team-profiles": {
    entityType: "TeamProfile",
    searchFields: ["name", "title", "bio"],
    defaultSort: { displayOrder: 1, createdAt: -1 },
    list(filter, pagination) {
      return TeamProfileModel.find(filter)
        .sort({ displayOrder: 1, createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean();
    },
    count(filter) {
      return TeamProfileModel.countDocuments(filter);
    },
    findOneLean(filter) {
      return TeamProfileModel.findOne(filter).lean();
    },
    findOneDocument(filter) {
      return TeamProfileModel.findOne(filter) as unknown as Promise<
        ContentDocumentShape | null
      >;
    },
    createRecord(input) {
      return TeamProfileModel.create(input) as unknown as Promise<ContentDocumentShape>;
    },
    buildCreateInput: buildTeamProfileCreateInput,
    buildUpdateInput: buildTeamProfileUpdateInput,
    applyQueryFilters(filter, query, isPublic) {
      if (isPublic) {
        filter.status = "published";
      } else if (query.status) {
        filter.status = requireEnum(query.status, "status", CONTENT_STATUSES);
      }
    },
  },
  "job-postings": {
    entityType: "JobPosting",
    searchFields: ["title", "department", "location", "summary"],
    defaultSort: { publishedAt: -1, createdAt: -1 },
    list(filter, pagination) {
      return JobPostingModel.find(filter)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean();
    },
    count(filter) {
      return JobPostingModel.countDocuments(filter);
    },
    findOneLean(filter) {
      return JobPostingModel.findOne(filter).lean();
    },
    findOneDocument(filter) {
      return JobPostingModel.findOne(filter) as unknown as Promise<
        ContentDocumentShape | null
      >;
    },
    createRecord(input) {
      return JobPostingModel.create(input) as unknown as Promise<ContentDocumentShape>;
    },
    buildCreateInput: buildJobPostingCreateInput,
    buildUpdateInput: buildJobPostingUpdateInput,
    applyQueryFilters(filter, query, isPublic) {
      if (isPublic) {
        filter.status = "published";
      } else if (query.status) {
        filter.status = requireEnum(query.status, "status", JOB_POSTING_STATUSES);
      }
    },
  },
};

function getResourceConfig(resource: CmsResourceKey): ContentResourceConfig {
  return resourceConfigMap[resource];
}

function buildSearchFilter(
  config: ContentResourceConfig,
  filter: Record<string, unknown>,
  searchValue: unknown,
): void {
  if (typeof searchValue !== "string" || searchValue.trim().length === 0) {
    return;
  }

  const regex = new RegExp(searchValue.trim(), "i");
  filter.$or = config.searchFields.map((field) => ({ [field]: regex }));
}

async function listContentInternal(
  resource: CmsResourceKey,
  query: Record<string, unknown>,
  isPublic: boolean,
): Promise<ContentListResult> {
  const config = getResourceConfig(resource);
  const pagination = parsePagination(query.page, query.limit);
  const filter: Record<string, unknown> = { deletedAt: null };

  config.applyQueryFilters(filter, query, isPublic);
  buildSearchFilter(config, filter, query.search);

  const [items, total] = await Promise.all([
    config.list(filter, pagination),
    config.count(filter),
  ]);

  return {
    items,
    total,
    page: pagination.page,
    limit: pagination.limit,
  };
}

async function getContentByIdentifier(
  resource: CmsResourceKey,
  identifier: string,
  isPublic: boolean,
) {
  const config = getResourceConfig(resource);
  const filter: Record<string, unknown> = {
    slug: requireString(identifier, "slug"),
    deletedAt: null,
  };

  config.applyQueryFilters(filter, {}, isPublic);

  const record = await config.findOneLean(filter);

  if (!record) {
    throw new AppError(`${config.entityType} not found`, 404, "NOT_FOUND");
  }

  return record;
}

export async function listPublicContent(
  resource: CmsResourceKey,
  query: Record<string, unknown>,
) {
  return listContentInternal(resource, query, true);
}

export async function getPublicContentBySlug(
  resource: CmsResourceKey,
  slug: string,
) {
  return getContentByIdentifier(resource, slug, true);
}

export async function listStaffContent(
  resource: CmsResourceKey,
  query: Record<string, unknown>,
) {
  return listContentInternal(resource, query, false);
}

export async function listAdminContent(
  resource: CmsResourceKey,
  query: Record<string, unknown>,
) {
  return listContentInternal(resource, query, false);
}

export async function getAdminContentById(
  resource: CmsResourceKey,
  id: string,
) {
  const config = getResourceConfig(resource);
  const record = await config.findOneDocument({
    _id: requireObjectId(id, "id"),
    deletedAt: null,
  });

  if (!record) {
    throw new AppError(`${config.entityType} not found`, 404, "NOT_FOUND");
  }

  return record;
}

export async function createAdminContent(
  resource: CmsResourceKey,
  payload: Record<string, unknown>,
  actorUserId: string,
  req: Request,
) {
  const config = getResourceConfig(resource);
  const input = await config.buildCreateInput(payload, actorUserId);
  const record = await config.createRecord(input);

  await createAuditLog({
    actorUserId,
    roleSnapshot: "admin",
    action: `admin.create_${config.entityType.toLowerCase()}`,
    entityType: config.entityType,
    entityId: record.id,
    method: req.method,
    route: req.originalUrl,
    ipAddress: getRequestIp(req),
    userAgent: getRequestUserAgent(req),
  });

  return record;
}

export async function updateAdminContent(
  resource: CmsResourceKey,
  id: string,
  payload: Record<string, unknown>,
  actorUserId: string,
  req: Request,
) {
  const config = getResourceConfig(resource);
  const record = await getAdminContentById(resource, id);
  const update = await config.buildUpdateInput(payload);

  record.set(update);
  await record.save();

  await createAuditLog({
    actorUserId,
    roleSnapshot: "admin",
    action: `admin.update_${config.entityType.toLowerCase()}`,
    entityType: config.entityType,
    entityId: record.id,
    method: req.method,
    route: req.originalUrl,
    ipAddress: getRequestIp(req),
    userAgent: getRequestUserAgent(req),
  });

  return record;
}

export async function archiveAdminContent(
  resource: CmsResourceKey,
  id: string,
  actorUserId: string,
  req: Request,
) {
  const config = getResourceConfig(resource);
  const record = await getAdminContentById(resource, id);

  record.set("deletedAt", new Date());
  record.set("deletedBy", actorUserId);
  await record.save();

  await createAuditLog({
    actorUserId,
    roleSnapshot: "admin",
    action: `admin.archive_${config.entityType.toLowerCase()}`,
    entityType: config.entityType,
    entityId: record.id,
    method: req.method,
    route: req.originalUrl,
    ipAddress: getRequestIp(req),
    userAgent: getRequestUserAgent(req),
  });

  return { success: true };
}
