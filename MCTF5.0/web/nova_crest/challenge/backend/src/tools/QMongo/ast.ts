/**
 * QMongo AST Node Definitions
 *
 * These types represent the Abstract Syntax Tree produced by the parser visitor.
 * They are deliberately simple data-only types with no behavior.
 */

// ─── Top Level ───────────────────────────────────────────────

export interface QMongoProgram {
  type: "Program";
  statements: Statement[];
}

export type Statement =
  | LetStatement
  | FromStatement
  | InsertStatement
  | UpdateStatement
  | DeleteStatement
  | AggregateStatement
  | PolicyStatement;

// ─── LET ─────────────────────────────────────────────────────

export interface LetStatement {
  type: "LetStatement";
  name: string;
  value: LiteralValue;
}

// ─── FROM (Find) ─────────────────────────────────────────────

export interface FromStatement {
  type: "FromStatement";
  model: string;
  where?: Expression;
  select?: string[];
  include?: IncludeClause[];
  orderBy?: OrderByField[];
  limit?: number | string; // number literal or variable name
  offset?: number | string;
}

export interface IncludeClause {
  type: "IncludeClause";
  relation: string;
  where?: Expression;
  select?: string[];
  include?: IncludeClause[];
  orderBy?: OrderByField[];
  limit?: number | string;
}

export interface OrderByField {
  field: string;
  direction: "asc" | "desc";
}

// ─── INSERT ──────────────────────────────────────────────────

export interface InsertStatement {
  type: "InsertStatement";
  model: string;
  fields: InsertField[];
}

export interface InsertField {
  name: string;
  value: LiteralValue;
}

// ─── UPDATE ──────────────────────────────────────────────────

export interface UpdateStatement {
  type: "UpdateStatement";
  model: string;
  where: Expression;
  set: SetField[];
}

export interface SetField {
  name: string;
  value: LiteralValue | FunctionCallExpr;
}

// ─── DELETE ──────────────────────────────────────────────────

export interface DeleteStatement {
  type: "DeleteStatement";
  model: string;
  where: Expression;
}

// ─── AGGREGATE ───────────────────────────────────────────────

export interface AggregateStatement {
  type: "AggregateStatement";
  model: string;
  match?: Expression;
  lookups?: LookupClause[];
  groupBy?: GroupByClause;
  having?: Expression;
  sort?: SortField[];
  limit?: number | string;
}

export interface LookupClause {
  type: "LookupClause";
  model: string;
  leftPath: string;
  rightPath: string;
}

export interface GroupByClause {
  field: string;
  aggregations: GroupAggregation[];
}

export interface GroupAggregation {
  alias: string;
  func: AggregateFunc;
}

export type AggregateFunc =
  | { name: "count" }
  | { name: "sum"; field: string }
  | { name: "avg"; field: string }
  | { name: "min"; field: string }
  | { name: "max"; field: string };

export interface SortField {
  field: string;
  direction: "asc" | "desc";
}

// ─── POLICY ──────────────────────────────────────────────────

export interface PolicyStatement {
  type: "PolicyStatement";
  model: string;
  rules: PolicyRule[];
}

export type PolicyRule =
  | { kind: "maxLimit"; value: number }
  | { kind: "allow"; fields: string[] }
  | { kind: "deny"; fields: string[] };

// ─── EXPRESSIONS ─────────────────────────────────────────────

export type Expression =
  | BinaryLogicalExpr
  | NotExpr
  | ComparisonExpr
  | ExprComparisonExpr
  | InExpr
  | NotInExpr
  | BetweenExpr
  | StringMatchExpr;

export interface BinaryLogicalExpr {
  type: "BinaryLogical";
  operator: "and" | "or";
  left: Expression;
  right: Expression;
}

export interface NotExpr {
  type: "Not";
  operand: Expression;
}

export interface ComparisonExpr {
  type: "Comparison";
  field: string;
  operator: "==" | "!=" | ">" | "<" | ">=" | "<=";
  value: LiteralValue;
}

export interface InExpr {
  type: "In";
  field: string;
  values: LiteralValue[];
}

export interface NotInExpr {
  type: "NotIn";
  field: string;
  values: LiteralValue[];
}

export interface BetweenExpr {
  type: "Between";
  field: string;
  low: LiteralValue;
  high: LiteralValue;
}

export interface ExprComparisonExpr {
  type: "ExprComparison";
  operator: "==" | "!=" | ">" | "<" | ">=" | "<=";
  left: ValueExpr;
  right: ValueExpr;
}

export interface StringMatchExpr {
  type: "StringMatch";
  field: string;
  operator: "contains" | "startsWith" | "endsWith";
  value: string;
}

// ─── VALUE EXPRESSIONS ($expr) ───────────────────────────────

export type ValueExpr =
  | FieldRefExpr
  | ArithmeticExpr
  | UnaryMinusExpr
  | ExprFuncCallExpr
  | NumericValExpr
  | StringValExpr
  | BooleanValExpr;

export interface FieldRefExpr {
  type: "FieldRef";
  path: string; // without $, e.g. "age", "address.city"
}

export interface ArithmeticExpr {
  type: "Arithmetic";
  operator: "+" | "-" | "*" | "/" | "%";
  left: ValueExpr;
  right: ValueExpr;
}

export interface UnaryMinusExpr {
  type: "UnaryMinus";
  operand: ValueExpr;
}

export interface ExprFuncCallExpr {
  type: "ExprFuncCall";
  name: string; // "size", "abs", "year", etc.
  args: ValueExpr[];
}

export interface NumericValExpr {
  type: "NumericVal";
  value: number;
}

export interface StringValExpr {
  type: "StringVal";
  value: string;
}

export interface BooleanValExpr {
  type: "BooleanVal";
  value: boolean;
}

// ─── LITERALS ────────────────────────────────────────────────

export type LiteralValue =
  | NumberLiteral
  | StringLiteral
  | BooleanLiteral
  | ArrayLiteral
  | VariableRef
  | FunctionCallExpr;

export interface NumberLiteral {
  type: "Number";
  value: number;
}

export interface StringLiteral {
  type: "String";
  value: string;
}

export interface BooleanLiteral {
  type: "Boolean";
  value: boolean;
}

export interface ArrayLiteral {
  type: "Array";
  elements: LiteralValue[];
}

export interface VariableRef {
  type: "VariableRef";
  name: string;
}

export interface FunctionCallExpr {
  type: "FunctionCall";
  name: string;
}
