/**
 * QMongo AST Builder Visitor
 *
 * Walks the ANTLR parse tree and produces a typed QMongo AST.
 */

import { QMongoVisitor } from "./generated/QMongoVisitor.js";
import { QMongoParser } from "./generated/QMongoParser.js";
import type {
  ProgramContext,
  StatementContext,
  LetStatementContext,
  FromStatementContext,
  WhereClauseContext,
  SelectClauseContext,
  FieldListContext,
  IncludeClauseContext,
  IncludeBodyContext,
  OrderByClauseContext,
  OrderFieldContext,
  LimitClauseContext,
  OffsetClauseContext,
  InsertStatementContext,
  InsertFieldListContext,
  InsertFieldContext,
  UpdateStatementContext,
  SetFieldListContext,
  SetFieldContext,
  DeleteStatementContext,
  AggregateStatementContext,
  AggregateBodyContext,
  MatchClauseContext,
  LookupClauseContext,
  DotPathContext,
  GroupByClauseContext,
  GroupFieldListContext,
  GroupFieldContext,
  AggregateFunctionContext,
  HavingClauseContext,
  SortClauseContext,
  SortFieldContext,
  PolicyStatementContext,
  PolicyBodyContext,
  PolicyRuleContext,
  ExpressionContext,
  OrExpressionContext,
  AndExpressionContext,
  NotExpressionContext,
  PrimaryExpressionContext,
  CompareOpContext,
  CompareFieldContext,
  InExprContext,
  InVarExprContext,
  NotInExprContext,
  NotInVarExprContext,
  BetweenExprContext,
  ContainsExprContext,
  StartsWithExprContext,
  EndsWithExprContext,
  ExprCompareContext,
  ComparisonOpContext,
  LiteralContext,
  StringLiteralContext,
  ArrayContext,
  FunctionCallContext,
  ValueExprContext,
  MulDivExprContext,
  AddSubExprContext,
  UnaryMinusExprContext,
  FuncExprContext,
  FieldRefExprContext,
  NumericExprContext,
  StringExprContext,
  BooleanExprContext,
  ParenValExprContext,
  ExprFuncContext,
} from "./generated/QMongoParser.js";
import type * as AST from "./ast.js";

export class ASTBuilder extends QMongoVisitor<any> {
  // ─── Program ───────────────────────────────────────────────

  override visitProgram = (ctx: ProgramContext): AST.QMongoProgram => {
    const statements: AST.Statement[] = [];
    for (const stmtCtx of ctx.statement()) {
      statements.push(this.visitStatement(stmtCtx));
    }
    return { type: "Program", statements };
  };

  visitStatement = (ctx: StatementContext): AST.Statement => {
    if (ctx.letStatement()) return this.visitLetStatement(ctx.letStatement()!);
    if (ctx.fromStatement())
      return this.visitFromStatement(ctx.fromStatement()!);
    if (ctx.insertStatement())
      return this.visitInsertStatement(ctx.insertStatement()!);
    if (ctx.updateStatement())
      return this.visitUpdateStatement(ctx.updateStatement()!);
    if (ctx.deleteStatement())
      return this.visitDeleteStatement(ctx.deleteStatement()!);
    if (ctx.aggregateStatement())
      return this.visitAggregateStatement(ctx.aggregateStatement()!);
    if (ctx.policyStatement())
      return this.visitPolicyStatement(ctx.policyStatement()!);
    throw new Error("Unknown statement type");
  };

  // ─── LET ───────────────────────────────────────────────────

  override visitLetStatement = (ctx: LetStatementContext): AST.LetStatement => {
    return {
      type: "LetStatement",
      name: ctx.IDENTIFIER().getText(),
      value: this.visitLiteral(ctx.literal()),
    };
  };

  // ─── FROM ──────────────────────────────────────────────────

  override visitFromStatement = (
    ctx: FromStatementContext,
  ): AST.FromStatement => {
    const result: AST.FromStatement = {
      type: "FromStatement",
      model: ctx.IDENTIFIER().getText(),
    };

    if (ctx.whereClause()) {
      result.where = this.visitWhereClause(ctx.whereClause()!);
    }
    if (ctx.selectClause()) {
      result.select = this.visitSelectClause(ctx.selectClause()!);
    }
    const includes = ctx.includeClause();
    if (includes.length > 0) {
      result.include = includes.map((ic) => this.visitIncludeClause(ic));
    }
    if (ctx.orderByClause()) {
      result.orderBy = this.visitOrderByClause(ctx.orderByClause()!);
    }
    if (ctx.limitClause()) {
      result.limit = this.visitLimitClause(ctx.limitClause()!);
    }
    if (ctx.offsetClause()) {
      result.offset = this.visitOffsetClause(ctx.offsetClause()!);
    }

    return result;
  };

  override visitWhereClause = (ctx: WhereClauseContext): AST.Expression => {
    return this.visitExpression(ctx.expression());
  };

  override visitSelectClause = (ctx: SelectClauseContext): string[] => {
    return this.visitFieldList(ctx.fieldList());
  };

  override visitFieldList = (ctx: FieldListContext): string[] => {
    return (ctx.IDENTIFIER() as any[]).map((id: any) => id.getText());
  };

  override visitIncludeClause = (
    ctx: IncludeClauseContext,
  ): AST.IncludeClause => {
    const result: AST.IncludeClause = {
      type: "IncludeClause",
      relation: ctx.IDENTIFIER().getText(),
    };

    if (ctx.includeBody()) {
      const body = ctx.includeBody()!;
      if (body.whereClause()) {
        result.where = this.visitWhereClause(body.whereClause()!);
      }
      if (body.selectClause()) {
        result.select = this.visitSelectClause(body.selectClause()!);
      }
      const includes = body.includeClause();
      if (includes.length > 0) {
        result.include = includes.map((ic) => this.visitIncludeClause(ic));
      }
      if (body.orderByClause()) {
        result.orderBy = this.visitOrderByClause(body.orderByClause()!);
      }
      if (body.limitClause()) {
        result.limit = this.visitLimitClause(body.limitClause()!);
      }
    }

    return result;
  };

  override visitOrderByClause = (
    ctx: OrderByClauseContext,
  ): AST.OrderByField[] => {
    return (ctx.orderField() as OrderFieldContext[]).map((of) =>
      this.visitOrderField(of),
    );
  };

  override visitOrderField = (ctx: OrderFieldContext): AST.OrderByField => {
    const dir = ctx.DESC() ? "desc" : "asc";
    return { field: ctx.IDENTIFIER().getText(), direction: dir };
  };

  override visitLimitClause = (ctx: LimitClauseContext): number | string => {
    if (ctx.NUMBER()) return Number(ctx.NUMBER()!.getText());
    return ctx.IDENTIFIER()!.getText();
  };

  override visitOffsetClause = (ctx: OffsetClauseContext): number | string => {
    if (ctx.NUMBER()) return Number(ctx.NUMBER()!.getText());
    return ctx.IDENTIFIER()!.getText();
  };

  // ─── INSERT ────────────────────────────────────────────────

  override visitInsertStatement = (
    ctx: InsertStatementContext,
  ): AST.InsertStatement => {
    return {
      type: "InsertStatement",
      model: ctx.IDENTIFIER().getText(),
      fields: this.visitInsertFieldList(ctx.insertFieldList()),
    };
  };

  override visitInsertFieldList = (
    ctx: InsertFieldListContext,
  ): AST.InsertField[] => {
    return (ctx.insertField() as InsertFieldContext[]).map((f) =>
      this.visitInsertField(f),
    );
  };

  override visitInsertField = (ctx: InsertFieldContext): AST.InsertField => {
    return {
      name: ctx.IDENTIFIER().getText(),
      value: this.visitLiteral(ctx.literal()),
    };
  };

  // ─── UPDATE ────────────────────────────────────────────────

  override visitUpdateStatement = (
    ctx: UpdateStatementContext,
  ): AST.UpdateStatement => {
    return {
      type: "UpdateStatement",
      model: ctx.IDENTIFIER().getText(),
      where: this.visitWhereClause(ctx.whereClause()),
      set: this.visitSetFieldList(ctx.setClause().setFieldList()),
    };
  };

  override visitSetFieldList = (ctx: SetFieldListContext): AST.SetField[] => {
    return (ctx.setField() as SetFieldContext[]).map((f) =>
      this.visitSetField(f),
    );
  };

  override visitSetField = (ctx: SetFieldContext): AST.SetField => {
    if (ctx.functionCall()) {
      return {
        name: ctx.IDENTIFIER().getText(),
        value: this.visitFunctionCall(ctx.functionCall()!),
      };
    }
    return {
      name: ctx.IDENTIFIER().getText(),
      value: this.visitLiteral(ctx.literal()!),
    };
  };

  // ─── DELETE ────────────────────────────────────────────────

  override visitDeleteStatement = (
    ctx: DeleteStatementContext,
  ): AST.DeleteStatement => {
    return {
      type: "DeleteStatement",
      model: ctx.IDENTIFIER().getText(),
      where: this.visitWhereClause(ctx.whereClause()),
    };
  };

  // ─── AGGREGATE ─────────────────────────────────────────────

  override visitAggregateStatement = (
    ctx: AggregateStatementContext,
  ): AST.AggregateStatement => {
    const body = ctx.aggregateBody();
    const result: AST.AggregateStatement = {
      type: "AggregateStatement",
      model: ctx.IDENTIFIER().getText(),
    };

    if (body.matchClause()) {
      result.match = this.visitMatchClause(body.matchClause()!);
    }
    const lookups = body.lookupClause();
    if (lookups.length > 0) {
      result.lookups = lookups.map((l) => this.visitLookupClause(l));
    }
    if (body.groupByClause()) {
      result.groupBy = this.visitGroupByClause(body.groupByClause()!);
    }
    if (body.havingClause()) {
      result.having = this.visitHavingClause(body.havingClause()!);
    }
    if (body.sortClause()) {
      result.sort = this.visitSortClause(body.sortClause()!);
    }
    if (body.limitClause()) {
      result.limit = this.visitLimitClause(body.limitClause()!);
    }

    return result;
  };

  override visitMatchClause = (ctx: MatchClauseContext): AST.Expression => {
    return this.visitExpression(ctx.expression());
  };

  override visitLookupClause = (ctx: LookupClauseContext): AST.LookupClause => {
    const dotPaths = ctx.dotPath();
    return {
      type: "LookupClause",
      model: ctx.IDENTIFIER().getText(),
      leftPath: this.visitDotPath(dotPaths[0]),
      rightPath: this.visitDotPath(dotPaths[1]),
    };
  };

  override visitDotPath = (ctx: DotPathContext): string => {
    return (ctx.IDENTIFIER() as any[]).map((id: any) => id.getText()).join(".");
  };

  override visitGroupByClause = (
    ctx: GroupByClauseContext,
  ): AST.GroupByClause => {
    return {
      field: ctx.IDENTIFIER().getText(),
      aggregations: this.visitGroupFieldList(ctx.groupFieldList()),
    };
  };

  override visitGroupFieldList = (
    ctx: GroupFieldListContext,
  ): AST.GroupAggregation[] => {
    return (ctx.groupField() as GroupFieldContext[]).map((gf) =>
      this.visitGroupField(gf),
    );
  };

  override visitGroupField = (ctx: GroupFieldContext): AST.GroupAggregation => {
    return {
      alias: ctx.IDENTIFIER().getText(),
      func: this.visitAggregateFunction(ctx.aggregateFunction()),
    };
  };

  override visitAggregateFunction = (
    ctx: AggregateFunctionContext,
  ): AST.AggregateFunc => {
    if (ctx.COUNT()) return { name: "count" };
    if (ctx.SUM()) return { name: "sum", field: ctx.IDENTIFIER()!.getText() };
    if (ctx.AVG()) return { name: "avg", field: ctx.IDENTIFIER()!.getText() };
    if (ctx.MIN_FUNC())
      return { name: "min", field: ctx.IDENTIFIER()!.getText() };
    if (ctx.MAX_FUNC())
      return { name: "max", field: ctx.IDENTIFIER()!.getText() };
    throw new Error("Unknown aggregate function");
  };

  override visitHavingClause = (ctx: HavingClauseContext): AST.Expression => {
    return this.visitExpression(ctx.expression());
  };

  override visitSortClause = (ctx: SortClauseContext): AST.SortField[] => {
    return (ctx.sortField() as SortFieldContext[]).map((sf) =>
      this.visitSortField(sf),
    );
  };

  override visitSortField = (ctx: SortFieldContext): AST.SortField => {
    const dir = ctx.DESC() ? "desc" : "asc";
    return { field: ctx.IDENTIFIER().getText(), direction: dir };
  };

  // ─── POLICY ────────────────────────────────────────────────

  override visitPolicyStatement = (
    ctx: PolicyStatementContext,
  ): AST.PolicyStatement => {
    return {
      type: "PolicyStatement",
      model: ctx.IDENTIFIER().getText(),
      rules: this.visitPolicyBody(ctx.policyBody()),
    };
  };

  override visitPolicyBody = (ctx: PolicyBodyContext): AST.PolicyRule[] => {
    return (ctx.policyRule() as PolicyRuleContext[]).map((pr) =>
      this.visitPolicyRule(pr),
    );
  };

  override visitPolicyRule = (ctx: PolicyRuleContext): AST.PolicyRule => {
    if (ctx.MAX_LIMIT()) {
      return { kind: "maxLimit", value: Number(ctx.NUMBER()!.getText()) };
    }
    if (ctx.ALLOW()) {
      return { kind: "allow", fields: this.visitFieldList(ctx.fieldList()!) };
    }
    if (ctx.DENY()) {
      return { kind: "deny", fields: this.visitFieldList(ctx.fieldList()!) };
    }
    throw new Error("Unknown policy rule");
  };

  // ─── EXPRESSIONS ───────────────────────────────────────────

  override visitExpression = (ctx: ExpressionContext): AST.Expression => {
    return this.visitOrExpression(ctx.orExpression());
  };

  override visitOrExpression = (ctx: OrExpressionContext): AST.Expression => {
    const parts = ctx.andExpression();
    let result: AST.Expression = this.visitAndExpression(parts[0]);
    for (let i = 1; i < parts.length; i++) {
      result = {
        type: "BinaryLogical",
        operator: "or",
        left: result,
        right: this.visitAndExpression(parts[i]),
      };
    }
    return result;
  };

  override visitAndExpression = (ctx: AndExpressionContext): AST.Expression => {
    const parts = ctx.notExpression();
    let result: AST.Expression = this.visitNotExpression(parts[0]);
    for (let i = 1; i < parts.length; i++) {
      result = {
        type: "BinaryLogical",
        operator: "and",
        left: result,
        right: this.visitNotExpression(parts[i]),
      };
    }
    return result;
  };

  override visitNotExpression = (ctx: NotExpressionContext): AST.Expression => {
    if (ctx.NOT()) {
      return {
        type: "Not",
        operand: this.visitNotExpression(ctx.notExpression()!),
      };
    }
    return this.visitPrimaryExpression(ctx.primaryExpression()!);
  };

  override visitPrimaryExpression = (
    ctx: PrimaryExpressionContext,
  ): AST.Expression => {
    if (ctx.expression()) {
      return this.visitExpression(ctx.expression()!);
    }
    return this.visitComparison(ctx.comparison()!);
  };

  // Comparison alternatives
  private visitComparison(ctx: any): AST.Expression {
    // Dispatch based on the labeled alternatives
    if (ctx.accept) {
      return ctx.accept(this);
    }
    throw new Error("Unknown comparison type");
  }

  override visitCompareOp = (ctx: CompareOpContext): AST.ComparisonExpr => {
    return {
      type: "Comparison",
      field: ctx.IDENTIFIER().getText(),
      operator: this.visitComparisonOp(ctx.comparisonOp()),
      value: this.visitLiteral(ctx.literal()),
    };
  };

  override visitCompareField = (
    ctx: CompareFieldContext,
  ): AST.ComparisonExpr => {
    const ids = ctx.IDENTIFIER();
    return {
      type: "Comparison",
      field: (ids as any[])[0].getText(),
      operator: this.visitComparisonOp(ctx.comparisonOp()),
      value: { type: "VariableRef", name: (ids as any[])[1].getText() },
    };
  };

  override visitInExpr = (ctx: InExprContext): AST.InExpr => {
    return {
      type: "In",
      field: ctx.IDENTIFIER().getText(),
      values: this.visitArray(ctx.array()),
    };
  };

  override visitInVarExpr = (ctx: InVarExprContext): AST.InExpr => {
    const ids = ctx.IDENTIFIER() as any[];
    return {
      type: "In",
      field: ids[0].getText(),
      values: [{ type: "VariableRef", name: ids[1].getText() }],
    };
  };

  override visitNotInExpr = (ctx: NotInExprContext): AST.NotInExpr => {
    return {
      type: "NotIn",
      field: ctx.IDENTIFIER().getText(),
      values: this.visitArray(ctx.array()),
    };
  };

  override visitNotInVarExpr = (ctx: NotInVarExprContext): AST.NotInExpr => {
    const ids = ctx.IDENTIFIER() as any[];
    return {
      type: "NotIn",
      field: ids[0].getText(),
      values: [{ type: "VariableRef", name: ids[1].getText() }],
    };
  };

  override visitBetweenExpr = (ctx: BetweenExprContext): AST.BetweenExpr => {
    const literals = ctx.literal();
    return {
      type: "Between",
      field: ctx.IDENTIFIER().getText(),
      low: this.visitLiteral(literals[0]),
      high: this.visitLiteral(literals[1]),
    };
  };

  override visitContainsExpr = (
    ctx: ContainsExprContext,
  ): AST.StringMatchExpr => {
    return {
      type: "StringMatch",
      field: ctx.IDENTIFIER().getText(),
      operator: "contains",
      value: this.parseString(ctx.stringLiteral().STRING().getText()),
    };
  };

  override visitStartsWithExpr = (
    ctx: StartsWithExprContext,
  ): AST.StringMatchExpr => {
    return {
      type: "StringMatch",
      field: ctx.IDENTIFIER().getText(),
      operator: "startsWith",
      value: this.parseString(ctx.stringLiteral().STRING().getText()),
    };
  };

  override visitEndsWithExpr = (
    ctx: EndsWithExprContext,
  ): AST.StringMatchExpr => {
    return {
      type: "StringMatch",
      field: ctx.IDENTIFIER().getText(),
      operator: "endsWith",
      value: this.parseString(ctx.stringLiteral().STRING().getText()),
    };
  };

  // ─── EXPR COMPARE ($expr) ─────────────────────────────────

  override visitExprCompare = (
    ctx: ExprCompareContext,
  ): AST.ExprComparisonExpr => {
    const valueExprs = ctx.valueExpr();
    return {
      type: "ExprComparison",
      operator: this.visitComparisonOp(ctx.comparisonOp()),
      left: this.visitValueExpr(valueExprs[0]),
      right: this.visitValueExpr(valueExprs[1]),
    };
  };

  // ─── VALUE EXPRESSIONS ────────────────────────────────────

  private visitValueExpr(ctx: ValueExprContext): AST.ValueExpr {
    return ctx.accept(this) as AST.ValueExpr;
  }

  override visitFieldRefExpr = (ctx: FieldRefExprContext): AST.FieldRefExpr => {
    const raw = ctx.FIELD_REF().getText(); // e.g. "$age" or "$address.city"
    return { type: "FieldRef", path: raw.substring(1) }; // strip leading $
  };

  override visitNumericExpr = (ctx: NumericExprContext): AST.NumericValExpr => {
    const text = ctx.NUMBER().getText();
    return {
      type: "NumericVal",
      value: text.includes(".") ? parseFloat(text) : parseInt(text, 10),
    };
  };

  override visitStringExpr = (ctx: StringExprContext): AST.StringValExpr => {
    return {
      type: "StringVal",
      value: this.parseString(ctx.STRING().getText()),
    };
  };

  override visitBooleanExpr = (ctx: BooleanExprContext): AST.BooleanValExpr => {
    return {
      type: "BooleanVal",
      value: ctx.BOOLEAN().getText().toLowerCase() === "true",
    };
  };

  override visitMulDivExpr = (ctx: MulDivExprContext): AST.ArithmeticExpr => {
    const parts = ctx.valueExpr();
    let op: AST.ArithmeticExpr["operator"];
    if (ctx.STAR()) op = "*";
    else if (ctx.SLASH()) op = "/";
    else op = "%";
    return {
      type: "Arithmetic",
      operator: op,
      left: this.visitValueExpr(parts[0]),
      right: this.visitValueExpr(parts[1]),
    };
  };

  override visitAddSubExpr = (ctx: AddSubExprContext): AST.ArithmeticExpr => {
    const parts = ctx.valueExpr();
    return {
      type: "Arithmetic",
      operator: ctx.PLUS() ? "+" : "-",
      left: this.visitValueExpr(parts[0]),
      right: this.visitValueExpr(parts[1]),
    };
  };

  override visitUnaryMinusExpr = (
    ctx: UnaryMinusExprContext,
  ): AST.UnaryMinusExpr => {
    return {
      type: "UnaryMinus",
      operand: this.visitValueExpr(ctx.valueExpr()),
    };
  };

  override visitFuncExpr = (ctx: FuncExprContext): AST.ExprFuncCallExpr => {
    return this.visitExprFunc(ctx.exprFunc());
  };

  override visitExprFunc = (ctx: ExprFuncContext): AST.ExprFuncCallExpr => {
    const name = ctx.IDENTIFIER()
      ? ctx.IDENTIFIER()!.getText()
      : ctx.NOW()!.getText();
    const args = (ctx.valueExpr() as ValueExprContext[]).map((ve) =>
      this.visitValueExpr(ve),
    );
    return { type: "ExprFuncCall", name, args };
  };

  override visitParenValExpr = (ctx: ParenValExprContext): AST.ValueExpr => {
    return this.visitValueExpr(ctx.valueExpr());
  };

  override visitComparisonOp = (
    ctx: ComparisonOpContext,
  ): AST.ComparisonExpr["operator"] => {
    if (ctx.EQ()) return "==";
    if (ctx.NEQ()) return "!=";
    if (ctx.GT()) return ">";
    if (ctx.LT()) return "<";
    if (ctx.GTE()) return ">=";
    if (ctx.LTE()) return "<=";
    throw new Error("Unknown comparison operator");
  };

  // ─── LITERALS ──────────────────────────────────────────────

  override visitLiteral = (ctx: LiteralContext): AST.LiteralValue => {
    if (ctx.NUMBER()) {
      const text = ctx.NUMBER()!.getText();
      const num = text.includes(".") ? parseFloat(text) : parseInt(text, 10);
      const negative = ctx.MINUS_OP() != null;
      return {
        type: "Number",
        value: negative ? -num : num,
      };
    }
    if (ctx.STRING()) {
      return {
        type: "String",
        value: this.parseString(ctx.STRING()!.getText()),
      };
    }
    if (ctx.BOOLEAN()) {
      return {
        type: "Boolean",
        value: ctx.BOOLEAN()!.getText().toLowerCase() === "true",
      };
    }
    if (ctx.array()) {
      return { type: "Array", elements: this.visitArray(ctx.array()!) };
    }
    if (ctx.functionCall()) {
      return this.visitFunctionCall(ctx.functionCall()!);
    }
    if (ctx.IDENTIFIER()) {
      return { type: "VariableRef", name: ctx.IDENTIFIER()!.getText() };
    }
    throw new Error("Unknown literal type");
  };

  override visitArray = (ctx: ArrayContext): AST.LiteralValue[] => {
    return (ctx.literal() as LiteralContext[]).map((l) => this.visitLiteral(l));
  };

  override visitFunctionCall = (
    ctx: FunctionCallContext,
  ): AST.FunctionCallExpr => {
    return { type: "FunctionCall", name: "now" };
  };

  // ─── Helpers ───────────────────────────────────────────────

  private parseString(raw: string): string {
    // Remove surrounding quotes and handle escape sequences
    const inner = raw.substring(1, raw.length - 1);
    return inner
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\\\/g, "\\")
      .replace(/\\"/g, '"');
  }

  protected defaultResult(): any {
    return null;
  }
}
