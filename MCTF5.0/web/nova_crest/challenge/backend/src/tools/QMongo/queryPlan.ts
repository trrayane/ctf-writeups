/**
 * QMongo QueryPlan Types
 *
 * Structured execution plans that the execution engine consumes.
 * No JavaScript code generation — these are pure data objects.
 */

// ─── Plan Union ──────────────────────────────────────────────

export type QueryPlan =
  | FindPlan
  | InsertPlan
  | UpdatePlan
  | DeletePlan
  | AggregatePlan;

// ─── Find ────────────────────────────────────────────────────

export interface FindPlan {
  type: "FindPlan";
  model: string;
  filter: Record<string, any>;
  projection?: Record<string, 1>;
  populate?: PopulateSpec[];
  sort?: Record<string, 1 | -1>;
  limit?: number;
  skip?: number;
}

export interface PopulateSpec {
  path: string;
  match?: Record<string, any>;
  select?: string;
  options?: {
    sort?: Record<string, 1 | -1>;
    limit?: number;
  };
  populate?: PopulateSpec[];
}

// ─── Insert ──────────────────────────────────────────────────

export interface InsertPlan {
  type: "InsertPlan";
  model: string;
  document: Record<string, any>;
}

// ─── Update ──────────────────────────────────────────────────

export interface UpdatePlan {
  type: "UpdatePlan";
  model: string;
  filter: Record<string, any>;
  update: { $set: Record<string, any> };
}

// ─── Delete ──────────────────────────────────────────────────

export interface DeletePlan {
  type: "DeletePlan";
  model: string;
  filter: Record<string, any>;
}

// ─── Aggregate ───────────────────────────────────────────────

export interface AggregatePlan {
  type: "AggregatePlan";
  model: string;
  pipeline: Record<string, any>[];
}
