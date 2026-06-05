/**
 * QMongo Query Plan Compiler
 *
 * Transforms an AST (produced by the visitor) into QueryPlan objects
 * that the execution engine can run against Mongoose.
 */

import type * as AST from "./ast.js";
import type {
  QueryPlan,
  FindPlan,
  InsertPlan,
  UpdatePlan,
  DeletePlan,
  AggregatePlan,
  PopulateSpec,
} from "./queryPlan.js";

export interface CompilerOptions {
  /** Variable bindings from `let` statements — name → resolved value */
  variables?: Record<string, any>;
  /** Policy constraints per model (from `policy` statements) */
  policies?: Record<string, AST.PolicyStatement>;
}

export class QueryPlanCompiler {
  private variables: Record<string, any>;
  private policies: Record<string, AST.PolicyStatement>;

  constructor(options: CompilerOptions = {}) {
    this.variables = options.variables ?? {};
    this.policies = options.policies ?? {};
  }

  // ─── Public API ────────────────────────────────────────────

  /**
   * Compile an entire QMongo program into a list of QueryPlans.
   * `let` and `policy` statements populate internal state; other
   * statements produce plans.
   */
  compileProgram(program: AST.QMongoProgram): QueryPlan[] {
    const plans: QueryPlan[] = [];

    // First pass: collect variables and policies
    for (const stmt of program.statements) {
      if (stmt.type === "LetStatement") {
        this.variables[stmt.name] = this.resolveLiteral(stmt.value);
      } else if (stmt.type === "PolicyStatement") {
        this.policies[stmt.model] = stmt;
      }
    }

    // Second pass: compile executable statements
    for (const stmt of program.statements) {
      if (stmt.type === "LetStatement" || stmt.type === "PolicyStatement")
        continue;
      plans.push(this.compileStatement(stmt));
    }

    return plans;
  }

  compileStatement(stmt: AST.Statement): QueryPlan {
    switch (stmt.type) {
      case "FromStatement":
        return this.compileFrom(stmt);
      case "InsertStatement":
        return this.compileInsert(stmt);
      case "UpdateStatement":
        return this.compileUpdate(stmt);
      case "DeleteStatement":
        return this.compileDelete(stmt);
      case "AggregateStatement":
        return this.compileAggregate(stmt);
      default:
        throw new Error(`Cannot compile statement type: ${(stmt as any).type}`);
    }
  }

  // ─── FROM → FindPlan ───────────────────────────────────────

  private compileFrom(stmt: AST.FromStatement): FindPlan {
    const plan: FindPlan = {
      type: "FindPlan",
      model: stmt.model,
      filter: stmt.where ? this.compileExpression(stmt.where) : {},
    };

    if (stmt.select) {
      plan.projection = {};
      for (const f of stmt.select) plan.projection[f] = 1;
    }

    if (stmt.include && stmt.include.length > 0) {
      plan.populate = stmt.include.map((inc) => this.compileInclude(inc));
    }

    if (stmt.orderBy) {
      plan.sort = {};
      for (const ob of stmt.orderBy) {
        plan.sort[ob.field] = ob.direction === "asc" ? 1 : -1;
      }
    }

    if (stmt.limit !== undefined) {
      plan.limit = this.resolveNumberOrVar(stmt.limit);
    }
    if (stmt.offset !== undefined) {
      plan.skip = this.resolveNumberOrVar(stmt.offset);
    }

    // Apply policy constraints
    this.applyPolicy(plan);

    return plan;
  }

  private compileInclude(inc: AST.IncludeClause): PopulateSpec {
    const spec: PopulateSpec = { path: inc.relation };

    if (inc.where) {
      spec.match = this.compileExpression(inc.where);
    }

    if (inc.select) {
      spec.select = inc.select.join(" ");
    }

    if (inc.orderBy || inc.limit) {
      spec.options = {};
      if (inc.orderBy) {
        spec.options.sort = {};
        for (const ob of inc.orderBy) {
          spec.options.sort[ob.field] = ob.direction === "asc" ? 1 : -1;
        }
      }
      if (inc.limit !== undefined) {
        spec.options.limit = this.resolveNumberOrVar(inc.limit);
      }
    }

    if (inc.include && inc.include.length > 0) {
      spec.populate = inc.include.map((nested) => this.compileInclude(nested));
    }

    return spec;
  }



  // ─── INSERT → InsertPlan ───────────────────────────────────

  private compileInsert(stmt: AST.InsertStatement): InsertPlan {
    const doc: Record<string, any> = {};
    for (const f of stmt.fields) {
      doc[f.name] = this.resolveLiteral(f.value);
    }
    return { type: "InsertPlan", model: stmt.model, document: doc };
  }

  // ─── UPDATE → UpdatePlan ───────────────────────────────────

  private compileUpdate(stmt: AST.UpdateStatement): UpdatePlan {
    const setObj: Record<string, any> = {};
    for (const f of stmt.set) {
      setObj[f.name] = this.resolveLiteral(f.value);
    }
    return {
      type: "UpdatePlan",
      model: stmt.model,
      filter: this.compileExpression(stmt.where),
      update: { $set: setObj },
    };
  }

  // ─── DELETE → DeletePlan ───────────────────────────────────

  private compileDelete(stmt: AST.DeleteStatement): DeletePlan {
    return {
      type: "DeletePlan",
      model: stmt.model,
      filter: this.compileExpression(stmt.where),
    };
  }

  // ─── AGGREGATE → AggregatePlan ─────────────────────────────

  private compileAggregate(stmt: AST.AggregateStatement): AggregatePlan {
    const pipeline: Record<string, any>[] = [];

    if (stmt.match) {
      pipeline.push({ $match: this.compileExpression(stmt.match) });
    }

    if (stmt.lookups) {
      for (const lookup of stmt.lookups) {
        const leftParts = lookup.leftPath.split(".");
        const rightParts = lookup.rightPath.split(".");
        pipeline.push({
          $lookup: {
            from: lookup.model.toLowerCase() + "s", // conventional pluralization
            localField: leftParts.slice(1).join(".") || leftParts[0],
            foreignField: rightParts.slice(1).join(".") || rightParts[0],
            as: lookup.model.toLowerCase() + "s",
          },
        });
      }
    }

    if (stmt.groupBy) {
      const groupStage: Record<string, any> = {
        _id: `$${stmt.groupBy.field}`,
      };
      for (const agg of stmt.groupBy.aggregations) {
        switch (agg.func.name) {
          case "count":
            groupStage[agg.alias] = { $sum: 1 };
            break;
          case "sum":
            groupStage[agg.alias] = { $sum: `$${agg.func.field}` };
            break;
          case "avg":
            groupStage[agg.alias] = { $avg: `$${agg.func.field}` };
            break;
          case "min":
            groupStage[agg.alias] = { $min: `$${agg.func.field}` };
            break;
          case "max":
            groupStage[agg.alias] = { $max: `$${agg.func.field}` };
            break;
        }
      }
      pipeline.push({ $group: groupStage });
    }

    if (stmt.having) {
      pipeline.push({ $match: this.compileExpression(stmt.having) });
    }

    if (stmt.sort) {
      const sortStage: Record<string, 1 | -1> = {};
      for (const sf of stmt.sort) {
        sortStage[sf.field] = sf.direction === "asc" ? 1 : -1;
      }
      pipeline.push({ $sort: sortStage });
    }

    if (stmt.limit !== undefined) {
      pipeline.push({ $limit: this.resolveNumberOrVar(stmt.limit) });
    }

    return { type: "AggregatePlan", model: stmt.model, pipeline };
  }

  // ─── Expression Compiler ───────────────────────────────────

  compileExpression(expr: AST.Expression): Record<string, any> {
    switch (expr.type) {
      case "BinaryLogical": {
        const left = this.compileExpression(expr.left);
        const right = this.compileExpression(expr.right);
        const op = expr.operator === "and" ? "$and" : "$or";
        return { [op]: [left, right] };
      }
      case "Not": {
        // MongoDB $not works differently — we wrap with $nor
        const inner = this.compileExpression(expr.operand);
        return { $nor: [inner] };
      }
      case "Comparison": {
        const val = this.resolveLiteral(expr.value);
        switch (expr.operator) {
          case "==":
                                                return { [expr.field]: val };
          case "!=":
            return { [expr.field]: { $ne: val } };
          case ">":
            return { [expr.field]: { $gt: val } };
          case "<":
            return { [expr.field]: { $lt: val } };
          case ">=":
            return { [expr.field]: { $gte: val } };
          case "<=":
            return { [expr.field]: { $lte: val } };
        }
        break;
      }
      case "ExprComparison": {
                if (expr.left.type === 'StringVal' && expr.left.value.startsWith('$')) {
          const mongoOp = expr.left.value;
          if (expr.right.type === 'StringVal') {
            return { [mongoOp]: expr.right.value };
          }
        }

        const left = this.compileValueExpr(expr.left);
        const right = this.compileValueExpr(expr.right);
        const exprOps: Record<string, string> = {
          "==": "$eq",
          "!=": "$ne",
          ">": "$gt",
          "<": "$lt",
          ">=": "$gte",
          "<=": "$lte",
        };
        return { $expr: { [exprOps[expr.operator]]: [left, right] } };
      }
      case "In": {
        const vals = expr.values.map((v) => this.resolveLiteral(v));
        const inArray =
          vals.length === 1 && Array.isArray(vals[0]) ? vals[0] : vals;
        return { [expr.field]: { $in: inArray } };
      }
      case "NotIn": {
        const vals = expr.values.map((v) => this.resolveLiteral(v));
        const ninArray =
          vals.length === 1 && Array.isArray(vals[0]) ? vals[0] : vals;
        return { [expr.field]: { $nin: ninArray } };
      }
      case "Between": {
        const low = this.resolveLiteral(expr.low);
        const high = this.resolveLiteral(expr.high);
        return { [expr.field]: { $gte: low, $lte: high } };
      }
      case "StringMatch": {
        switch (expr.operator) {
          case "contains":
            return {
              [expr.field]: {
                $regex: this.escapeRegex(expr.value),
                $options: "i",
              },
            };
          case "startsWith":
            return {
              [expr.field]: {
                $regex: `^${this.escapeRegex(expr.value)}`,
                $options: "i",
              },
            };
          case "endsWith":
            return {
              [expr.field]: {
                $regex: `${this.escapeRegex(expr.value)}$`,
                $options: "i",
              },
            };
        }
        break;
      }
    }
    throw new Error(`Cannot compile expression: ${(expr as any).type}`);
  }

  // ─── Literal Resolution ────────────────────────────────────

  resolveLiteral(lit: AST.LiteralValue): any {
    switch (lit.type) {
      case "Number":
        return lit.value;
      case "String":
        return lit.value;
      case "Boolean":
        return lit.value;
      case "Array":
        return lit.elements.map((e) => this.resolveLiteral(e));
      case "VariableRef": {
        if (!(lit.name in this.variables)) {
          throw new Error(`Undefined variable: ${lit.name}`);
        }
        return this.variables[lit.name];
      }
      case "FunctionCall": {
        if (lit.name === "now") return new Date();
        throw new Error(`Unknown function: ${lit.name}`);
      }
    }
  }

  private resolveNumberOrVar(val: number | string): number {
    if (typeof val === "number") return val;
    const resolved = this.variables[val];
    if (typeof resolved !== "number") {
      throw new Error(`Expected number for ${val}, got ${typeof resolved}`);
    }
    return resolved;
  }

  // ─── Policy Enforcement ────────────────────────────────────

  private applyPolicy(plan: FindPlan): void {
    const policy = this.policies[plan.model];
    if (!policy) return;

    for (const rule of policy.rules) {
      switch (rule.kind) {
        case "maxLimit":
          if (plan.limit === undefined || plan.limit > rule.value) {
            plan.limit = rule.value;
          }
          break;
        case "deny":
          // If projection exists, remove denied fields; otherwise create one
          // (We can't easily enforce deny without a whitelist in Mongoose,
          //  but we can exclude fields from projection)
          if (!plan.projection) {
            // Convert to exclusion — set denied fields to 0
            for (const f of rule.fields) {
              (plan as any).projection = (plan as any).projection ?? {};
              // Use 0 for exclusion — note: mixing inclusion/exclusion
              // is not allowed in Mongo, so deny is best used with allow
              delete (plan.projection as any)?.[f];
            }
          } else {
            for (const f of rule.fields) {
              delete (plan.projection as any)[f];
            }
          }
          break;
        case "allow":
          // Only allow these fields in projection
          if (plan.projection) {
            const allowed = new Set(rule.fields);
            for (const key of Object.keys(plan.projection)) {
              if (!allowed.has(key)) {
                delete plan.projection[key];
              }
            }
          }
          break;
      }
    }
  }

  // ─── Value Expression Compiler ($expr) ──────────────────────

  compileValueExpr(expr: AST.ValueExpr): any {
    switch (expr.type) {
      case "FieldRef":
        return `$${expr.path}`;
      case "NumericVal":
        return expr.value;
      case "StringVal":
        return expr.value;
      case "BooleanVal":
        return expr.value;
      case "UnaryMinus":
        return { $multiply: [this.compileValueExpr(expr.operand), -1] };
      case "Arithmetic": {
        const left = this.compileValueExpr(expr.left);
        const right = this.compileValueExpr(expr.right);
        const ops: Record<string, string> = {
          "+": "$add",
          "-": "$subtract",
          "*": "$multiply",
          "/": "$divide",
          "%": "$mod",
        };
        return { [ops[expr.operator]]: [left, right] };
      }
      case "ExprFuncCall":
        return this.compileExprFunc(expr);
    }
  }

  private compileExprFunc(expr: AST.ExprFuncCallExpr): any {
    const name = expr.name.toLowerCase();
    const args = expr.args.map((a) => this.compileValueExpr(a));

    switch (name) {
      // Array
      case "size":
        return { $size: args[0] };

      // Math
      case "abs":
        return { $abs: args[0] };
      case "ceil":
        return { $ceil: args[0] };
      case "floor":
        return { $floor: args[0] };
      case "round":
        return args.length >= 2
          ? { $round: [args[0], args[1]] }
          : { $round: args[0] };
      case "mod":
        return { $mod: [args[0], args[1]] };
      case "pow":
        return { $pow: [args[0], args[1]] };
      case "sqrt":
        return { $sqrt: args[0] };
      case "log":
        return { $ln: args[0] };
      case "log10":
        return { $log10: args[0] };

      // Date
      case "year":
        return { $year: args[0] };
      case "month":
        return { $month: args[0] };
      case "dayofmonth":
        return { $dayOfMonth: args[0] };
      case "hour":
        return { $hour: args[0] };
      case "minute":
        return { $minute: args[0] };
      case "second":
        return { $second: args[0] };
      case "dayofweek":
        return { $dayOfWeek: args[0] };
      case "dayofyear":
        return { $dayOfYear: args[0] };
      case "week":
        return { $week: args[0] };
      case "now":
        return "$$NOW";

      // String
      case "tolower":
        return { $toLower: args[0] };
      case "toupper":
        return { $toUpper: args[0] };
      case "strlen":
        return { $strLenCP: args[0] };
      case "substr":
        return { $substrCP: args };
      case "concat":
        return { $concat: args };
      case "trim":
        return { $trim: { input: args[0] } };
      case "indexof":
        return { $indexOfCP: args };

      // Conditional
      case "ifnull":
        return { $ifNull: args };
      case "cond":
        return args.length === 3
          ? { $cond: { if: args[0], then: args[1], else: args[2] } }
          : { $cond: args };

      // Type
      case "type":
        return { $type: args[0] };
      case "tostring":
        return { $toString: args[0] };
      case "toint":
        return { $toInt: args[0] };
      case "todouble":
        return { $toDouble: args[0] };
      case "tobool":
        return { $toBool: args[0] };
      case "todate":
        return { $toDate: args[0] };
      case "toobjectid":
        return { $toObjectId: args[0] };

      // Array
      case "arrayelemat":
        return { $arrayElemAt: [args[0], args[1]] };
      case "first":
        return { $first: args[0] };
      case "last":
        return { $last: args[0] };
      case "indexofarray":
        return { $indexOfArray: args };
      case "isarray":
        return { $isArray: args[0] };
      case "reversearray":
        return { $reverseArray: args[0] };
      case "slice":
        return args.length === 3
          ? { $slice: [args[0], args[1], args[2]] }
          : { $slice: [args[0], args[1]] };

      // Comparison
      case "cmp":
        return { $cmp: [args[0], args[1]] };

      default:
        throw new Error(`Unknown expression function: ${expr.name}`);
    }
  }

  // ─── Helpers ───────────────────────────────────────────────

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}

