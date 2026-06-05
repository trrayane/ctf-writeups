/**
 * QMongo Execution Engine
 *
 * Executes QueryPlan objects against Mongoose models.
 * No eval, no code generation — purely data-driven execution.
 */

import type { Model, Document } from "mongoose";
import type {
  QueryPlan,
  FindPlan,
  InsertPlan,
  UpdatePlan,
  DeletePlan,
  AggregatePlan,
  PopulateSpec,
} from "./queryPlan.js";

export interface ExecutionContext {
  /**
   * Map of model name → Mongoose Model instance.
   * The engine looks up models by the name used in QMongo statements.
   */
  models: Record<string, Model<any>>;
}

export interface ExecutionResult {
  plan: QueryPlan;
  data: any;
}

export class ExecutionEngine {
  private models: Record<string, Model<any>>;

  constructor(ctx: ExecutionContext) {
    this.models = ctx.models;
  }

  /**
   * Execute a list of plans sequentially and return all results.
   */
  async executeAll(plans: QueryPlan[]): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = [];
    for (const plan of plans) {
      const data = await this.execute(plan);
      results.push({ plan, data });
    }
    return results;
  }

  /**
   * Execute a single QueryPlan.
   */
  async execute(plan: QueryPlan): Promise<any> {
    switch (plan.type) {
      case "FindPlan":
        return this.executeFind(plan);
      case "InsertPlan":
        return this.executeInsert(plan);
      case "UpdatePlan":
        return this.executeUpdate(plan);
      case "DeletePlan":
        return this.executeDelete(plan);
      case "AggregatePlan":
        return this.executeAggregate(plan);
      default:
        throw new Error(`Unknown plan type: ${(plan as any).type}`);
    }
  }

  // ─── Find ──────────────────────────────────────────────────

  private async executeFind(plan: FindPlan): Promise<Document[]> {
    const Model = this.getModel(plan.model);

    let query = Model.find(plan.filter);

    if (plan.projection) {
      query = query.select(plan.projection);
    }

    if (plan.sort) {
      query = query.sort(plan.sort);
    }

    if (plan.skip !== undefined) {
      query = query.skip(plan.skip);
    }

    if (plan.limit !== undefined) {
      query = query.limit(plan.limit);
    }

    if (plan.populate) {
      for (const pop of plan.populate) {        query = query.populate(this.buildPopulate(pop));
      }
    }

    return query.exec();
  }

  private buildPopulate(spec: PopulateSpec): any {
    const populateObj: any = { ...spec };
    
                if (populateObj.match && typeof populateObj.match === 'object' && !Array.isArray(populateObj.match)) {
      populateObj.match = [populateObj.match];
    }
    
    if (populateObj.populate) {
      populateObj.populate = populateObj.populate.map((p: PopulateSpec) => this.buildPopulate(p));
    }
    return populateObj;
  }

  // ─── Insert ────────────────────────────────────────────────

  private async executeInsert(plan: InsertPlan): Promise<Document> {
    const Model = this.getModel(plan.model);
    const doc = new Model(plan.document);
    return doc.save();
  }

  // ─── Update ────────────────────────────────────────────────

  private async executeUpdate(plan: UpdatePlan): Promise<any> {
    const Model = this.getModel(plan.model);
    return Model.updateMany(plan.filter, plan.update).exec();
  }

  // ─── Delete ────────────────────────────────────────────────

  private async executeDelete(plan: DeletePlan): Promise<any> {
    const Model = this.getModel(plan.model);
    return Model.deleteMany(plan.filter).exec();
  }

  // ─── Aggregate ─────────────────────────────────────────────

  private async executeAggregate(plan: AggregatePlan): Promise<any[]> {
    const Model = this.getModel(plan.model);
    return Model.aggregate(plan.pipeline as any[]).exec();
  }

  // ─── Helpers ───────────────────────────────────────────────

  private getModel(name: string): Model<any> {
    const model = this.models[name];
    if (!model) {
      throw new Error(
        `Model "${name}" not found. Available models: ${Object.keys(this.models).join(", ")}`,
      );
    }
    return model;
  }
}

