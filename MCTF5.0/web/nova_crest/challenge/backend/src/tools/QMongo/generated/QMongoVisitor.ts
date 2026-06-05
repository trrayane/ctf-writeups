// Generated from src/tools/QMongo/grammar/QMongo.g4 by ANTLR 4.13.1

import { AbstractParseTreeVisitor } from "antlr4ng";


import { ProgramContext } from "./QMongoParser.js";
import { StatementContext } from "./QMongoParser.js";
import { LetStatementContext } from "./QMongoParser.js";
import { FromStatementContext } from "./QMongoParser.js";
import { WhereClauseContext } from "./QMongoParser.js";
import { SelectClauseContext } from "./QMongoParser.js";
import { FieldListContext } from "./QMongoParser.js";
import { IncludeClauseContext } from "./QMongoParser.js";
import { IncludeBodyContext } from "./QMongoParser.js";
import { OrderByClauseContext } from "./QMongoParser.js";
import { OrderFieldContext } from "./QMongoParser.js";
import { LimitClauseContext } from "./QMongoParser.js";
import { OffsetClauseContext } from "./QMongoParser.js";
import { InsertStatementContext } from "./QMongoParser.js";
import { InsertFieldListContext } from "./QMongoParser.js";
import { InsertFieldContext } from "./QMongoParser.js";
import { UpdateStatementContext } from "./QMongoParser.js";
import { SetClauseContext } from "./QMongoParser.js";
import { SetFieldListContext } from "./QMongoParser.js";
import { SetFieldContext } from "./QMongoParser.js";
import { DeleteStatementContext } from "./QMongoParser.js";
import { AggregateStatementContext } from "./QMongoParser.js";
import { AggregateBodyContext } from "./QMongoParser.js";
import { MatchClauseContext } from "./QMongoParser.js";
import { LookupClauseContext } from "./QMongoParser.js";
import { DotPathContext } from "./QMongoParser.js";
import { GroupByClauseContext } from "./QMongoParser.js";
import { GroupFieldListContext } from "./QMongoParser.js";
import { GroupFieldContext } from "./QMongoParser.js";
import { AggregateFunctionContext } from "./QMongoParser.js";
import { HavingClauseContext } from "./QMongoParser.js";
import { SortClauseContext } from "./QMongoParser.js";
import { SortFieldContext } from "./QMongoParser.js";
import { PolicyStatementContext } from "./QMongoParser.js";
import { PolicyBodyContext } from "./QMongoParser.js";
import { PolicyRuleContext } from "./QMongoParser.js";
import { ExpressionContext } from "./QMongoParser.js";
import { OrExpressionContext } from "./QMongoParser.js";
import { AndExpressionContext } from "./QMongoParser.js";
import { NotExpressionContext } from "./QMongoParser.js";
import { PrimaryExpressionContext } from "./QMongoParser.js";
import { CompareOpContext } from "./QMongoParser.js";
import { CompareFieldContext } from "./QMongoParser.js";
import { InExprContext } from "./QMongoParser.js";
import { InVarExprContext } from "./QMongoParser.js";
import { NotInExprContext } from "./QMongoParser.js";
import { NotInVarExprContext } from "./QMongoParser.js";
import { BetweenExprContext } from "./QMongoParser.js";
import { ContainsExprContext } from "./QMongoParser.js";
import { StartsWithExprContext } from "./QMongoParser.js";
import { EndsWithExprContext } from "./QMongoParser.js";
import { ExprCompareContext } from "./QMongoParser.js";
import { ComparisonOpContext } from "./QMongoParser.js";
import { StringExprContext } from "./QMongoParser.js";
import { NumericExprContext } from "./QMongoParser.js";
import { MulDivExprContext } from "./QMongoParser.js";
import { FieldRefExprContext } from "./QMongoParser.js";
import { FuncExprContext } from "./QMongoParser.js";
import { ParenValExprContext } from "./QMongoParser.js";
import { AddSubExprContext } from "./QMongoParser.js";
import { BooleanExprContext } from "./QMongoParser.js";
import { UnaryMinusExprContext } from "./QMongoParser.js";
import { ExprFuncContext } from "./QMongoParser.js";
import { LiteralContext } from "./QMongoParser.js";
import { StringLiteralContext } from "./QMongoParser.js";
import { ArrayContext } from "./QMongoParser.js";
import { FunctionCallContext } from "./QMongoParser.js";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `QMongoParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export class QMongoVisitor<Result> extends AbstractParseTreeVisitor<Result> {
    /**
     * Visit a parse tree produced by `QMongoParser.program`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitProgram?: (ctx: ProgramContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStatement?: (ctx: StatementContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.letStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLetStatement?: (ctx: LetStatementContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.fromStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFromStatement?: (ctx: FromStatementContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.whereClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitWhereClause?: (ctx: WhereClauseContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.selectClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSelectClause?: (ctx: SelectClauseContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.fieldList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFieldList?: (ctx: FieldListContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.includeClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIncludeClause?: (ctx: IncludeClauseContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.includeBody`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIncludeBody?: (ctx: IncludeBodyContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.orderByClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitOrderByClause?: (ctx: OrderByClauseContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.orderField`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitOrderField?: (ctx: OrderFieldContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.limitClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLimitClause?: (ctx: LimitClauseContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.offsetClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitOffsetClause?: (ctx: OffsetClauseContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.insertStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitInsertStatement?: (ctx: InsertStatementContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.insertFieldList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitInsertFieldList?: (ctx: InsertFieldListContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.insertField`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitInsertField?: (ctx: InsertFieldContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.updateStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUpdateStatement?: (ctx: UpdateStatementContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.setClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSetClause?: (ctx: SetClauseContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.setFieldList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSetFieldList?: (ctx: SetFieldListContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.setField`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSetField?: (ctx: SetFieldContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.deleteStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDeleteStatement?: (ctx: DeleteStatementContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.aggregateStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAggregateStatement?: (ctx: AggregateStatementContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.aggregateBody`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAggregateBody?: (ctx: AggregateBodyContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.matchClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMatchClause?: (ctx: MatchClauseContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.lookupClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLookupClause?: (ctx: LookupClauseContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.dotPath`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDotPath?: (ctx: DotPathContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.groupByClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGroupByClause?: (ctx: GroupByClauseContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.groupFieldList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGroupFieldList?: (ctx: GroupFieldListContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.groupField`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGroupField?: (ctx: GroupFieldContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.aggregateFunction`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAggregateFunction?: (ctx: AggregateFunctionContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.havingClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitHavingClause?: (ctx: HavingClauseContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.sortClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSortClause?: (ctx: SortClauseContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.sortField`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSortField?: (ctx: SortFieldContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.policyStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPolicyStatement?: (ctx: PolicyStatementContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.policyBody`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPolicyBody?: (ctx: PolicyBodyContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.policyRule`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPolicyRule?: (ctx: PolicyRuleContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.expression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExpression?: (ctx: ExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.orExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitOrExpression?: (ctx: OrExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.andExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAndExpression?: (ctx: AndExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.notExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNotExpression?: (ctx: NotExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPrimaryExpression?: (ctx: PrimaryExpressionContext) => Result;
    /**
     * Visit a parse tree produced by the `CompareOp`
     * labeled alternative in `QMongoParser.comparison`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCompareOp?: (ctx: CompareOpContext) => Result;
    /**
     * Visit a parse tree produced by the `CompareField`
     * labeled alternative in `QMongoParser.comparison`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCompareField?: (ctx: CompareFieldContext) => Result;
    /**
     * Visit a parse tree produced by the `InExpr`
     * labeled alternative in `QMongoParser.comparison`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitInExpr?: (ctx: InExprContext) => Result;
    /**
     * Visit a parse tree produced by the `InVarExpr`
     * labeled alternative in `QMongoParser.comparison`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitInVarExpr?: (ctx: InVarExprContext) => Result;
    /**
     * Visit a parse tree produced by the `NotInExpr`
     * labeled alternative in `QMongoParser.comparison`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNotInExpr?: (ctx: NotInExprContext) => Result;
    /**
     * Visit a parse tree produced by the `NotInVarExpr`
     * labeled alternative in `QMongoParser.comparison`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNotInVarExpr?: (ctx: NotInVarExprContext) => Result;
    /**
     * Visit a parse tree produced by the `BetweenExpr`
     * labeled alternative in `QMongoParser.comparison`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBetweenExpr?: (ctx: BetweenExprContext) => Result;
    /**
     * Visit a parse tree produced by the `ContainsExpr`
     * labeled alternative in `QMongoParser.comparison`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitContainsExpr?: (ctx: ContainsExprContext) => Result;
    /**
     * Visit a parse tree produced by the `StartsWithExpr`
     * labeled alternative in `QMongoParser.comparison`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStartsWithExpr?: (ctx: StartsWithExprContext) => Result;
    /**
     * Visit a parse tree produced by the `EndsWithExpr`
     * labeled alternative in `QMongoParser.comparison`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEndsWithExpr?: (ctx: EndsWithExprContext) => Result;
    /**
     * Visit a parse tree produced by the `ExprCompare`
     * labeled alternative in `QMongoParser.comparison`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExprCompare?: (ctx: ExprCompareContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.comparisonOp`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitComparisonOp?: (ctx: ComparisonOpContext) => Result;
    /**
     * Visit a parse tree produced by the `StringExpr`
     * labeled alternative in `QMongoParser.valueExpr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStringExpr?: (ctx: StringExprContext) => Result;
    /**
     * Visit a parse tree produced by the `NumericExpr`
     * labeled alternative in `QMongoParser.valueExpr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNumericExpr?: (ctx: NumericExprContext) => Result;
    /**
     * Visit a parse tree produced by the `MulDivExpr`
     * labeled alternative in `QMongoParser.valueExpr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMulDivExpr?: (ctx: MulDivExprContext) => Result;
    /**
     * Visit a parse tree produced by the `FieldRefExpr`
     * labeled alternative in `QMongoParser.valueExpr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFieldRefExpr?: (ctx: FieldRefExprContext) => Result;
    /**
     * Visit a parse tree produced by the `FuncExpr`
     * labeled alternative in `QMongoParser.valueExpr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFuncExpr?: (ctx: FuncExprContext) => Result;
    /**
     * Visit a parse tree produced by the `ParenValExpr`
     * labeled alternative in `QMongoParser.valueExpr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitParenValExpr?: (ctx: ParenValExprContext) => Result;
    /**
     * Visit a parse tree produced by the `AddSubExpr`
     * labeled alternative in `QMongoParser.valueExpr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAddSubExpr?: (ctx: AddSubExprContext) => Result;
    /**
     * Visit a parse tree produced by the `BooleanExpr`
     * labeled alternative in `QMongoParser.valueExpr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBooleanExpr?: (ctx: BooleanExprContext) => Result;
    /**
     * Visit a parse tree produced by the `UnaryMinusExpr`
     * labeled alternative in `QMongoParser.valueExpr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUnaryMinusExpr?: (ctx: UnaryMinusExprContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.exprFunc`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExprFunc?: (ctx: ExprFuncContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.literal`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLiteral?: (ctx: LiteralContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.stringLiteral`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStringLiteral?: (ctx: StringLiteralContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.array`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitArray?: (ctx: ArrayContext) => Result;
    /**
     * Visit a parse tree produced by `QMongoParser.functionCall`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFunctionCall?: (ctx: FunctionCallContext) => Result;
}

