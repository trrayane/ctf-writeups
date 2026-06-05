// Generated from src/tools/QMongo/grammar/QMongo.g4 by ANTLR 4.13.1

import * as antlr from "antlr4ng";
import { Token } from "antlr4ng";

import { QMongoVisitor } from "./QMongoVisitor.js";

// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;


export class QMongoParser extends antlr.Parser {
    public static readonly LET = 1;
    public static readonly FROM = 2;
    public static readonly WHERE = 3;
    public static readonly SELECT = 4;
    public static readonly INCLUDE = 5;
    public static readonly ORDER = 6;
    public static readonly BY = 7;
    public static readonly ASC = 8;
    public static readonly DESC = 9;
    public static readonly LIMIT = 10;
    public static readonly OFFSET = 11;
    public static readonly INSERT = 12;
    public static readonly INTO = 13;
    public static readonly UPDATE = 14;
    public static readonly SET = 15;
    public static readonly DELETE = 16;
    public static readonly AGGREGATE = 17;
    public static readonly MATCH = 18;
    public static readonly GROUP = 19;
    public static readonly HAVING = 20;
    public static readonly SORT = 21;
    public static readonly LOOKUP = 22;
    public static readonly ON = 23;
    public static readonly POLICY = 24;
    public static readonly MAX_LIMIT = 25;
    public static readonly ALLOW = 26;
    public static readonly DENY = 27;
    public static readonly FIELDS = 28;
    public static readonly FILTER = 29;
    public static readonly AND = 30;
    public static readonly OR = 31;
    public static readonly NOT = 32;
    public static readonly IN = 33;
    public static readonly BETWEEN = 34;
    public static readonly CONTAINS = 35;
    public static readonly STARTS_WITH = 36;
    public static readonly ENDS_WITH = 37;
    public static readonly NOW = 38;
    public static readonly COUNT = 39;
    public static readonly SUM = 40;
    public static readonly AVG = 41;
    public static readonly MIN_FUNC = 42;
    public static readonly MAX_FUNC = 43;
    public static readonly BOOLEAN = 44;
    public static readonly EQ = 45;
    public static readonly NEQ = 46;
    public static readonly GTE = 47;
    public static readonly LTE = 48;
    public static readonly GT = 49;
    public static readonly LT = 50;
    public static readonly ASSIGN = 51;
    public static readonly PLUS = 52;
    public static readonly MINUS_OP = 53;
    public static readonly STAR = 54;
    public static readonly SLASH = 55;
    public static readonly MODULO = 56;
    public static readonly LBRACE = 57;
    public static readonly RBRACE = 58;
    public static readonly LBRACKET = 59;
    public static readonly RBRACKET = 60;
    public static readonly LPAREN = 61;
    public static readonly RPAREN = 62;
    public static readonly COMMA = 63;
    public static readonly DOT = 64;
    public static readonly COLON = 65;
    public static readonly NUMBER = 66;
    public static readonly STRING = 67;
    public static readonly FIELD_REF = 68;
    public static readonly IDENTIFIER = 69;
    public static readonly WS = 70;
    public static readonly LINE_COMMENT = 71;
    public static readonly RULE_program = 0;
    public static readonly RULE_statement = 1;
    public static readonly RULE_letStatement = 2;
    public static readonly RULE_fromStatement = 3;
    public static readonly RULE_whereClause = 4;
    public static readonly RULE_selectClause = 5;
    public static readonly RULE_fieldList = 6;
    public static readonly RULE_includeClause = 7;
    public static readonly RULE_includeBody = 8;
    public static readonly RULE_orderByClause = 9;
    public static readonly RULE_orderField = 10;
    public static readonly RULE_limitClause = 11;
    public static readonly RULE_offsetClause = 12;
    public static readonly RULE_insertStatement = 13;
    public static readonly RULE_insertFieldList = 14;
    public static readonly RULE_insertField = 15;
    public static readonly RULE_updateStatement = 16;
    public static readonly RULE_setClause = 17;
    public static readonly RULE_setFieldList = 18;
    public static readonly RULE_setField = 19;
    public static readonly RULE_deleteStatement = 20;
    public static readonly RULE_aggregateStatement = 21;
    public static readonly RULE_aggregateBody = 22;
    public static readonly RULE_matchClause = 23;
    public static readonly RULE_lookupClause = 24;
    public static readonly RULE_dotPath = 25;
    public static readonly RULE_groupByClause = 26;
    public static readonly RULE_groupFieldList = 27;
    public static readonly RULE_groupField = 28;
    public static readonly RULE_aggregateFunction = 29;
    public static readonly RULE_havingClause = 30;
    public static readonly RULE_sortClause = 31;
    public static readonly RULE_sortField = 32;
    public static readonly RULE_policyStatement = 33;
    public static readonly RULE_policyBody = 34;
    public static readonly RULE_policyRule = 35;
    public static readonly RULE_expression = 36;
    public static readonly RULE_orExpression = 37;
    public static readonly RULE_andExpression = 38;
    public static readonly RULE_notExpression = 39;
    public static readonly RULE_primaryExpression = 40;
    public static readonly RULE_comparison = 41;
    public static readonly RULE_comparisonOp = 42;
    public static readonly RULE_valueExpr = 43;
    public static readonly RULE_exprFunc = 44;
    public static readonly RULE_literal = 45;
    public static readonly RULE_stringLiteral = 46;
    public static readonly RULE_array = 47;
    public static readonly RULE_functionCall = 48;

    public static readonly literalNames = [
        null, null, null, null, null, null, null, null, null, null, null, 
        null, null, null, null, null, null, null, null, null, null, null, 
        null, null, null, null, null, null, null, null, null, null, null, 
        null, null, null, null, null, null, null, null, null, null, null, 
        null, "'=='", "'!='", "'>='", "'<='", "'>'", "'<'", "'='", "'+'", 
        "'-'", "'*'", "'/'", "'%'", "'{'", "'}'", "'['", "']'", "'('", "')'", 
        "','", "'.'", "':'"
    ];

    public static readonly symbolicNames = [
        null, "LET", "FROM", "WHERE", "SELECT", "INCLUDE", "ORDER", "BY", 
        "ASC", "DESC", "LIMIT", "OFFSET", "INSERT", "INTO", "UPDATE", "SET", 
        "DELETE", "AGGREGATE", "MATCH", "GROUP", "HAVING", "SORT", "LOOKUP", 
        "ON", "POLICY", "MAX_LIMIT", "ALLOW", "DENY", "FIELDS", "FILTER", 
        "AND", "OR", "NOT", "IN", "BETWEEN", "CONTAINS", "STARTS_WITH", 
        "ENDS_WITH", "NOW", "COUNT", "SUM", "AVG", "MIN_FUNC", "MAX_FUNC", 
        "BOOLEAN", "EQ", "NEQ", "GTE", "LTE", "GT", "LT", "ASSIGN", "PLUS", 
        "MINUS_OP", "STAR", "SLASH", "MODULO", "LBRACE", "RBRACE", "LBRACKET", 
        "RBRACKET", "LPAREN", "RPAREN", "COMMA", "DOT", "COLON", "NUMBER", 
        "STRING", "FIELD_REF", "IDENTIFIER", "WS", "LINE_COMMENT"
    ];
    public static readonly ruleNames = [
        "program", "statement", "letStatement", "fromStatement", "whereClause", 
        "selectClause", "fieldList", "includeClause", "includeBody", "orderByClause", 
        "orderField", "limitClause", "offsetClause", "insertStatement", 
        "insertFieldList", "insertField", "updateStatement", "setClause", 
        "setFieldList", "setField", "deleteStatement", "aggregateStatement", 
        "aggregateBody", "matchClause", "lookupClause", "dotPath", "groupByClause", 
        "groupFieldList", "groupField", "aggregateFunction", "havingClause", 
        "sortClause", "sortField", "policyStatement", "policyBody", "policyRule", 
        "expression", "orExpression", "andExpression", "notExpression", 
        "primaryExpression", "comparison", "comparisonOp", "valueExpr", 
        "exprFunc", "literal", "stringLiteral", "array", "functionCall",
    ];

    public get grammarFileName(): string { return "QMongo.g4"; }
    public get literalNames(): (string | null)[] { return QMongoParser.literalNames; }
    public get symbolicNames(): (string | null)[] { return QMongoParser.symbolicNames; }
    public get ruleNames(): string[] { return QMongoParser.ruleNames; }
    public get serializedATN(): number[] { return QMongoParser._serializedATN; }

    protected createFailedPredicateException(predicate?: string, message?: string): antlr.FailedPredicateException {
        return new antlr.FailedPredicateException(this, predicate, message);
    }

    public constructor(input: antlr.TokenStream) {
        super(input);
        this.interpreter = new antlr.ParserATNSimulator(this, QMongoParser._ATN, QMongoParser.decisionsToDFA, new antlr.PredictionContextCache());
    }
    public program(): ProgramContext {
        let localContext = new ProgramContext(this.context, this.state);
        this.enterRule(localContext, 0, QMongoParser.RULE_program);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 101;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 16994310) !== 0)) {
                {
                {
                this.state = 98;
                this.statement();
                }
                }
                this.state = 103;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 104;
            this.match(QMongoParser.EOF);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public statement(): StatementContext {
        let localContext = new StatementContext(this.context, this.state);
        this.enterRule(localContext, 2, QMongoParser.RULE_statement);
        try {
            this.state = 113;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QMongoParser.LET:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 106;
                this.letStatement();
                }
                break;
            case QMongoParser.FROM:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 107;
                this.fromStatement();
                }
                break;
            case QMongoParser.INSERT:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 108;
                this.insertStatement();
                }
                break;
            case QMongoParser.UPDATE:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 109;
                this.updateStatement();
                }
                break;
            case QMongoParser.DELETE:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 110;
                this.deleteStatement();
                }
                break;
            case QMongoParser.AGGREGATE:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 111;
                this.aggregateStatement();
                }
                break;
            case QMongoParser.POLICY:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 112;
                this.policyStatement();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public letStatement(): LetStatementContext {
        let localContext = new LetStatementContext(this.context, this.state);
        this.enterRule(localContext, 4, QMongoParser.RULE_letStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 115;
            this.match(QMongoParser.LET);
            this.state = 116;
            this.match(QMongoParser.IDENTIFIER);
            this.state = 117;
            this.match(QMongoParser.ASSIGN);
            this.state = 118;
            this.literal();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public fromStatement(): FromStatementContext {
        let localContext = new FromStatementContext(this.context, this.state);
        this.enterRule(localContext, 6, QMongoParser.RULE_fromStatement);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 120;
            this.match(QMongoParser.FROM);
            this.state = 121;
            this.match(QMongoParser.IDENTIFIER);
            this.state = 123;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 3) {
                {
                this.state = 122;
                this.whereClause();
                }
            }

            this.state = 126;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 4) {
                {
                this.state = 125;
                this.selectClause();
                }
            }

            this.state = 131;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 5) {
                {
                {
                this.state = 128;
                this.includeClause();
                }
                }
                this.state = 133;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 135;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 6) {
                {
                this.state = 134;
                this.orderByClause();
                }
            }

            this.state = 138;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 10) {
                {
                this.state = 137;
                this.limitClause();
                }
            }

            this.state = 141;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 11) {
                {
                this.state = 140;
                this.offsetClause();
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public whereClause(): WhereClauseContext {
        let localContext = new WhereClauseContext(this.context, this.state);
        this.enterRule(localContext, 8, QMongoParser.RULE_whereClause);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 143;
            this.match(QMongoParser.WHERE);
            this.state = 144;
            this.expression();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public selectClause(): SelectClauseContext {
        let localContext = new SelectClauseContext(this.context, this.state);
        this.enterRule(localContext, 10, QMongoParser.RULE_selectClause);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 146;
            this.match(QMongoParser.SELECT);
            this.state = 147;
            this.fieldList();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public fieldList(): FieldListContext {
        let localContext = new FieldListContext(this.context, this.state);
        this.enterRule(localContext, 12, QMongoParser.RULE_fieldList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 149;
            this.match(QMongoParser.IDENTIFIER);
            this.state = 154;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 63) {
                {
                {
                this.state = 150;
                this.match(QMongoParser.COMMA);
                this.state = 151;
                this.match(QMongoParser.IDENTIFIER);
                }
                }
                this.state = 156;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public includeClause(): IncludeClauseContext {
        let localContext = new IncludeClauseContext(this.context, this.state);
        this.enterRule(localContext, 14, QMongoParser.RULE_includeClause);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 157;
            this.match(QMongoParser.INCLUDE);
            this.state = 158;
            this.match(QMongoParser.IDENTIFIER);
            this.state = 163;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 57) {
                {
                this.state = 159;
                this.match(QMongoParser.LBRACE);
                this.state = 160;
                this.includeBody();
                this.state = 161;
                this.match(QMongoParser.RBRACE);
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public includeBody(): IncludeBodyContext {
        let localContext = new IncludeBodyContext(this.context, this.state);
        this.enterRule(localContext, 16, QMongoParser.RULE_includeBody);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 166;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 3) {
                {
                this.state = 165;
                this.whereClause();
                }
            }

            this.state = 169;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 4) {
                {
                this.state = 168;
                this.selectClause();
                }
            }

            this.state = 172;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 6) {
                {
                this.state = 171;
                this.orderByClause();
                }
            }

            this.state = 175;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 10) {
                {
                this.state = 174;
                this.limitClause();
                }
            }

            this.state = 180;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 5) {
                {
                {
                this.state = 177;
                this.includeClause();
                }
                }
                this.state = 182;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public orderByClause(): OrderByClauseContext {
        let localContext = new OrderByClauseContext(this.context, this.state);
        this.enterRule(localContext, 18, QMongoParser.RULE_orderByClause);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 183;
            this.match(QMongoParser.ORDER);
            this.state = 184;
            this.match(QMongoParser.BY);
            this.state = 185;
            this.orderField();
            this.state = 190;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 63) {
                {
                {
                this.state = 186;
                this.match(QMongoParser.COMMA);
                this.state = 187;
                this.orderField();
                }
                }
                this.state = 192;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public orderField(): OrderFieldContext {
        let localContext = new OrderFieldContext(this.context, this.state);
        this.enterRule(localContext, 20, QMongoParser.RULE_orderField);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 193;
            this.match(QMongoParser.IDENTIFIER);
            this.state = 195;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 8 || _la === 9) {
                {
                this.state = 194;
                _la = this.tokenStream.LA(1);
                if(!(_la === 8 || _la === 9)) {
                this.errorHandler.recoverInline(this);
                }
                else {
                    this.errorHandler.reportMatch(this);
                    this.consume();
                }
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public limitClause(): LimitClauseContext {
        let localContext = new LimitClauseContext(this.context, this.state);
        this.enterRule(localContext, 22, QMongoParser.RULE_limitClause);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 197;
            this.match(QMongoParser.LIMIT);
            this.state = 198;
            _la = this.tokenStream.LA(1);
            if(!(_la === 66 || _la === 69)) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public offsetClause(): OffsetClauseContext {
        let localContext = new OffsetClauseContext(this.context, this.state);
        this.enterRule(localContext, 24, QMongoParser.RULE_offsetClause);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 200;
            this.match(QMongoParser.OFFSET);
            this.state = 201;
            _la = this.tokenStream.LA(1);
            if(!(_la === 66 || _la === 69)) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public insertStatement(): InsertStatementContext {
        let localContext = new InsertStatementContext(this.context, this.state);
        this.enterRule(localContext, 26, QMongoParser.RULE_insertStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 203;
            this.match(QMongoParser.INSERT);
            this.state = 204;
            this.match(QMongoParser.INTO);
            this.state = 205;
            this.match(QMongoParser.IDENTIFIER);
            this.state = 206;
            this.match(QMongoParser.LBRACE);
            this.state = 207;
            this.insertFieldList();
            this.state = 208;
            this.match(QMongoParser.RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public insertFieldList(): InsertFieldListContext {
        let localContext = new InsertFieldListContext(this.context, this.state);
        this.enterRule(localContext, 28, QMongoParser.RULE_insertFieldList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 210;
            this.insertField();
            this.state = 215;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 63) {
                {
                {
                this.state = 211;
                this.match(QMongoParser.COMMA);
                this.state = 212;
                this.insertField();
                }
                }
                this.state = 217;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public insertField(): InsertFieldContext {
        let localContext = new InsertFieldContext(this.context, this.state);
        this.enterRule(localContext, 30, QMongoParser.RULE_insertField);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 218;
            this.match(QMongoParser.IDENTIFIER);
            this.state = 219;
            this.match(QMongoParser.COLON);
            this.state = 220;
            this.literal();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public updateStatement(): UpdateStatementContext {
        let localContext = new UpdateStatementContext(this.context, this.state);
        this.enterRule(localContext, 32, QMongoParser.RULE_updateStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 222;
            this.match(QMongoParser.UPDATE);
            this.state = 223;
            this.match(QMongoParser.IDENTIFIER);
            this.state = 224;
            this.whereClause();
            this.state = 225;
            this.setClause();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public setClause(): SetClauseContext {
        let localContext = new SetClauseContext(this.context, this.state);
        this.enterRule(localContext, 34, QMongoParser.RULE_setClause);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 227;
            this.match(QMongoParser.SET);
            this.state = 228;
            this.match(QMongoParser.LBRACE);
            this.state = 229;
            this.setFieldList();
            this.state = 230;
            this.match(QMongoParser.RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public setFieldList(): SetFieldListContext {
        let localContext = new SetFieldListContext(this.context, this.state);
        this.enterRule(localContext, 36, QMongoParser.RULE_setFieldList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 232;
            this.setField();
            this.state = 237;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 63) {
                {
                {
                this.state = 233;
                this.match(QMongoParser.COMMA);
                this.state = 234;
                this.setField();
                }
                }
                this.state = 239;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public setField(): SetFieldContext {
        let localContext = new SetFieldContext(this.context, this.state);
        this.enterRule(localContext, 38, QMongoParser.RULE_setField);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 240;
            this.match(QMongoParser.IDENTIFIER);
            this.state = 241;
            this.match(QMongoParser.ASSIGN);
            this.state = 244;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 19, this.context) ) {
            case 1:
                {
                this.state = 242;
                this.literal();
                }
                break;
            case 2:
                {
                this.state = 243;
                this.functionCall();
                }
                break;
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public deleteStatement(): DeleteStatementContext {
        let localContext = new DeleteStatementContext(this.context, this.state);
        this.enterRule(localContext, 40, QMongoParser.RULE_deleteStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 246;
            this.match(QMongoParser.DELETE);
            this.state = 247;
            this.match(QMongoParser.FROM);
            this.state = 248;
            this.match(QMongoParser.IDENTIFIER);
            this.state = 249;
            this.whereClause();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public aggregateStatement(): AggregateStatementContext {
        let localContext = new AggregateStatementContext(this.context, this.state);
        this.enterRule(localContext, 42, QMongoParser.RULE_aggregateStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 251;
            this.match(QMongoParser.AGGREGATE);
            this.state = 252;
            this.match(QMongoParser.IDENTIFIER);
            this.state = 253;
            this.match(QMongoParser.LBRACE);
            this.state = 254;
            this.aggregateBody();
            this.state = 255;
            this.match(QMongoParser.RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public aggregateBody(): AggregateBodyContext {
        let localContext = new AggregateBodyContext(this.context, this.state);
        this.enterRule(localContext, 44, QMongoParser.RULE_aggregateBody);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 258;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 18) {
                {
                this.state = 257;
                this.matchClause();
                }
            }

            this.state = 263;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 22) {
                {
                {
                this.state = 260;
                this.lookupClause();
                }
                }
                this.state = 265;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 267;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 19) {
                {
                this.state = 266;
                this.groupByClause();
                }
            }

            this.state = 270;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 20) {
                {
                this.state = 269;
                this.havingClause();
                }
            }

            this.state = 273;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 21) {
                {
                this.state = 272;
                this.sortClause();
                }
            }

            this.state = 276;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 10) {
                {
                this.state = 275;
                this.limitClause();
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public matchClause(): MatchClauseContext {
        let localContext = new MatchClauseContext(this.context, this.state);
        this.enterRule(localContext, 46, QMongoParser.RULE_matchClause);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 278;
            this.match(QMongoParser.MATCH);
            this.state = 279;
            this.expression();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public lookupClause(): LookupClauseContext {
        let localContext = new LookupClauseContext(this.context, this.state);
        this.enterRule(localContext, 48, QMongoParser.RULE_lookupClause);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 281;
            this.match(QMongoParser.LOOKUP);
            this.state = 282;
            this.match(QMongoParser.IDENTIFIER);
            this.state = 283;
            this.match(QMongoParser.ON);
            this.state = 284;
            this.dotPath();
            this.state = 285;
            this.match(QMongoParser.EQ);
            this.state = 286;
            this.dotPath();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public dotPath(): DotPathContext {
        let localContext = new DotPathContext(this.context, this.state);
        this.enterRule(localContext, 50, QMongoParser.RULE_dotPath);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 288;
            this.match(QMongoParser.IDENTIFIER);
            this.state = 293;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 64) {
                {
                {
                this.state = 289;
                this.match(QMongoParser.DOT);
                this.state = 290;
                this.match(QMongoParser.IDENTIFIER);
                }
                }
                this.state = 295;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public groupByClause(): GroupByClauseContext {
        let localContext = new GroupByClauseContext(this.context, this.state);
        this.enterRule(localContext, 52, QMongoParser.RULE_groupByClause);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 296;
            this.match(QMongoParser.GROUP);
            this.state = 297;
            this.match(QMongoParser.BY);
            this.state = 298;
            this.match(QMongoParser.IDENTIFIER);
            this.state = 299;
            this.match(QMongoParser.LBRACE);
            this.state = 300;
            this.groupFieldList();
            this.state = 301;
            this.match(QMongoParser.RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public groupFieldList(): GroupFieldListContext {
        let localContext = new GroupFieldListContext(this.context, this.state);
        this.enterRule(localContext, 54, QMongoParser.RULE_groupFieldList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 303;
            this.groupField();
            this.state = 308;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 63) {
                {
                {
                this.state = 304;
                this.match(QMongoParser.COMMA);
                this.state = 305;
                this.groupField();
                }
                }
                this.state = 310;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public groupField(): GroupFieldContext {
        let localContext = new GroupFieldContext(this.context, this.state);
        this.enterRule(localContext, 56, QMongoParser.RULE_groupField);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 311;
            this.match(QMongoParser.IDENTIFIER);
            this.state = 312;
            this.match(QMongoParser.ASSIGN);
            this.state = 313;
            this.aggregateFunction();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public aggregateFunction(): AggregateFunctionContext {
        let localContext = new AggregateFunctionContext(this.context, this.state);
        this.enterRule(localContext, 58, QMongoParser.RULE_aggregateFunction);
        try {
            this.state = 334;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QMongoParser.COUNT:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 315;
                this.match(QMongoParser.COUNT);
                this.state = 316;
                this.match(QMongoParser.LPAREN);
                this.state = 317;
                this.match(QMongoParser.RPAREN);
                }
                break;
            case QMongoParser.SUM:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 318;
                this.match(QMongoParser.SUM);
                this.state = 319;
                this.match(QMongoParser.LPAREN);
                this.state = 320;
                this.match(QMongoParser.IDENTIFIER);
                this.state = 321;
                this.match(QMongoParser.RPAREN);
                }
                break;
            case QMongoParser.AVG:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 322;
                this.match(QMongoParser.AVG);
                this.state = 323;
                this.match(QMongoParser.LPAREN);
                this.state = 324;
                this.match(QMongoParser.IDENTIFIER);
                this.state = 325;
                this.match(QMongoParser.RPAREN);
                }
                break;
            case QMongoParser.MIN_FUNC:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 326;
                this.match(QMongoParser.MIN_FUNC);
                this.state = 327;
                this.match(QMongoParser.LPAREN);
                this.state = 328;
                this.match(QMongoParser.IDENTIFIER);
                this.state = 329;
                this.match(QMongoParser.RPAREN);
                }
                break;
            case QMongoParser.MAX_FUNC:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 330;
                this.match(QMongoParser.MAX_FUNC);
                this.state = 331;
                this.match(QMongoParser.LPAREN);
                this.state = 332;
                this.match(QMongoParser.IDENTIFIER);
                this.state = 333;
                this.match(QMongoParser.RPAREN);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public havingClause(): HavingClauseContext {
        let localContext = new HavingClauseContext(this.context, this.state);
        this.enterRule(localContext, 60, QMongoParser.RULE_havingClause);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 336;
            this.match(QMongoParser.HAVING);
            this.state = 337;
            this.expression();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public sortClause(): SortClauseContext {
        let localContext = new SortClauseContext(this.context, this.state);
        this.enterRule(localContext, 62, QMongoParser.RULE_sortClause);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 339;
            this.match(QMongoParser.SORT);
            this.state = 340;
            this.sortField();
            this.state = 345;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 63) {
                {
                {
                this.state = 341;
                this.match(QMongoParser.COMMA);
                this.state = 342;
                this.sortField();
                }
                }
                this.state = 347;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public sortField(): SortFieldContext {
        let localContext = new SortFieldContext(this.context, this.state);
        this.enterRule(localContext, 64, QMongoParser.RULE_sortField);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 348;
            this.match(QMongoParser.IDENTIFIER);
            this.state = 350;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 8 || _la === 9) {
                {
                this.state = 349;
                _la = this.tokenStream.LA(1);
                if(!(_la === 8 || _la === 9)) {
                this.errorHandler.recoverInline(this);
                }
                else {
                    this.errorHandler.reportMatch(this);
                    this.consume();
                }
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public policyStatement(): PolicyStatementContext {
        let localContext = new PolicyStatementContext(this.context, this.state);
        this.enterRule(localContext, 66, QMongoParser.RULE_policyStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 352;
            this.match(QMongoParser.POLICY);
            this.state = 353;
            this.match(QMongoParser.IDENTIFIER);
            this.state = 354;
            this.match(QMongoParser.LBRACE);
            this.state = 355;
            this.policyBody();
            this.state = 356;
            this.match(QMongoParser.RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public policyBody(): PolicyBodyContext {
        let localContext = new PolicyBodyContext(this.context, this.state);
        this.enterRule(localContext, 68, QMongoParser.RULE_policyBody);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 361;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 234881024) !== 0)) {
                {
                {
                this.state = 358;
                this.policyRule();
                }
                }
                this.state = 363;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public policyRule(): PolicyRuleContext {
        let localContext = new PolicyRuleContext(this.context, this.state);
        this.enterRule(localContext, 70, QMongoParser.RULE_policyRule);
        try {
            this.state = 372;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QMongoParser.MAX_LIMIT:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 364;
                this.match(QMongoParser.MAX_LIMIT);
                this.state = 365;
                this.match(QMongoParser.NUMBER);
                }
                break;
            case QMongoParser.ALLOW:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 366;
                this.match(QMongoParser.ALLOW);
                this.state = 367;
                this.match(QMongoParser.FIELDS);
                this.state = 368;
                this.fieldList();
                }
                break;
            case QMongoParser.DENY:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 369;
                this.match(QMongoParser.DENY);
                this.state = 370;
                this.match(QMongoParser.FIELDS);
                this.state = 371;
                this.fieldList();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public expression(): ExpressionContext {
        let localContext = new ExpressionContext(this.context, this.state);
        this.enterRule(localContext, 72, QMongoParser.RULE_expression);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 374;
            this.orExpression();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public orExpression(): OrExpressionContext {
        let localContext = new OrExpressionContext(this.context, this.state);
        this.enterRule(localContext, 74, QMongoParser.RULE_orExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 376;
            this.andExpression();
            this.state = 381;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 31) {
                {
                {
                this.state = 377;
                this.match(QMongoParser.OR);
                this.state = 378;
                this.andExpression();
                }
                }
                this.state = 383;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public andExpression(): AndExpressionContext {
        let localContext = new AndExpressionContext(this.context, this.state);
        this.enterRule(localContext, 76, QMongoParser.RULE_andExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 384;
            this.notExpression();
            this.state = 389;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 30) {
                {
                {
                this.state = 385;
                this.match(QMongoParser.AND);
                this.state = 386;
                this.notExpression();
                }
                }
                this.state = 391;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public notExpression(): NotExpressionContext {
        let localContext = new NotExpressionContext(this.context, this.state);
        this.enterRule(localContext, 78, QMongoParser.RULE_notExpression);
        try {
            this.state = 395;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QMongoParser.NOT:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 392;
                this.match(QMongoParser.NOT);
                this.state = 393;
                this.notExpression();
                }
                break;
            case QMongoParser.NOW:
            case QMongoParser.BOOLEAN:
            case QMongoParser.MINUS_OP:
            case QMongoParser.LPAREN:
            case QMongoParser.NUMBER:
            case QMongoParser.STRING:
            case QMongoParser.FIELD_REF:
            case QMongoParser.IDENTIFIER:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 394;
                this.primaryExpression();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public primaryExpression(): PrimaryExpressionContext {
        let localContext = new PrimaryExpressionContext(this.context, this.state);
        this.enterRule(localContext, 80, QMongoParser.RULE_primaryExpression);
        try {
            this.state = 402;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 36, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 397;
                this.match(QMongoParser.LPAREN);
                this.state = 398;
                this.expression();
                this.state = 399;
                this.match(QMongoParser.RPAREN);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 401;
                this.comparison();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public comparison(): ComparisonContext {
        let localContext = new ComparisonContext(this.context, this.state);
        this.enterRule(localContext, 82, QMongoParser.RULE_comparison);
        try {
            this.state = 445;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 37, this.context) ) {
            case 1:
                localContext = new CompareOpContext(localContext);
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 404;
                this.match(QMongoParser.IDENTIFIER);
                this.state = 405;
                this.comparisonOp();
                this.state = 406;
                this.literal();
                }
                break;
            case 2:
                localContext = new CompareFieldContext(localContext);
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 408;
                this.match(QMongoParser.IDENTIFIER);
                this.state = 409;
                this.comparisonOp();
                this.state = 410;
                this.match(QMongoParser.IDENTIFIER);
                }
                break;
            case 3:
                localContext = new InExprContext(localContext);
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 412;
                this.match(QMongoParser.IDENTIFIER);
                this.state = 413;
                this.match(QMongoParser.IN);
                this.state = 414;
                this.array();
                }
                break;
            case 4:
                localContext = new InVarExprContext(localContext);
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 415;
                this.match(QMongoParser.IDENTIFIER);
                this.state = 416;
                this.match(QMongoParser.IN);
                this.state = 417;
                this.match(QMongoParser.IDENTIFIER);
                }
                break;
            case 5:
                localContext = new NotInExprContext(localContext);
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 418;
                this.match(QMongoParser.IDENTIFIER);
                this.state = 419;
                this.match(QMongoParser.NOT);
                this.state = 420;
                this.match(QMongoParser.IN);
                this.state = 421;
                this.array();
                }
                break;
            case 6:
                localContext = new NotInVarExprContext(localContext);
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 422;
                this.match(QMongoParser.IDENTIFIER);
                this.state = 423;
                this.match(QMongoParser.NOT);
                this.state = 424;
                this.match(QMongoParser.IN);
                this.state = 425;
                this.match(QMongoParser.IDENTIFIER);
                }
                break;
            case 7:
                localContext = new BetweenExprContext(localContext);
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 426;
                this.match(QMongoParser.IDENTIFIER);
                this.state = 427;
                this.match(QMongoParser.BETWEEN);
                this.state = 428;
                this.literal();
                this.state = 429;
                this.match(QMongoParser.AND);
                this.state = 430;
                this.literal();
                }
                break;
            case 8:
                localContext = new ContainsExprContext(localContext);
                this.enterOuterAlt(localContext, 8);
                {
                this.state = 432;
                this.match(QMongoParser.IDENTIFIER);
                this.state = 433;
                this.match(QMongoParser.CONTAINS);
                this.state = 434;
                this.stringLiteral();
                }
                break;
            case 9:
                localContext = new StartsWithExprContext(localContext);
                this.enterOuterAlt(localContext, 9);
                {
                this.state = 435;
                this.match(QMongoParser.IDENTIFIER);
                this.state = 436;
                this.match(QMongoParser.STARTS_WITH);
                this.state = 437;
                this.stringLiteral();
                }
                break;
            case 10:
                localContext = new EndsWithExprContext(localContext);
                this.enterOuterAlt(localContext, 10);
                {
                this.state = 438;
                this.match(QMongoParser.IDENTIFIER);
                this.state = 439;
                this.match(QMongoParser.ENDS_WITH);
                this.state = 440;
                this.stringLiteral();
                }
                break;
            case 11:
                localContext = new ExprCompareContext(localContext);
                this.enterOuterAlt(localContext, 11);
                {
                this.state = 441;
                this.valueExpr(0);
                this.state = 442;
                this.comparisonOp();
                this.state = 443;
                this.valueExpr(0);
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public comparisonOp(): ComparisonOpContext {
        let localContext = new ComparisonOpContext(this.context, this.state);
        this.enterRule(localContext, 84, QMongoParser.RULE_comparisonOp);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 447;
            _la = this.tokenStream.LA(1);
            if(!(((((_la - 45)) & ~0x1F) === 0 && ((1 << (_la - 45)) & 63) !== 0))) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }

    public valueExpr(): ValueExprContext;
    public valueExpr(_p: number): ValueExprContext;
    public valueExpr(_p?: number): ValueExprContext {
        if (_p === undefined) {
            _p = 0;
        }

        let parentContext = this.context;
        let parentState = this.state;
        let localContext = new ValueExprContext(this.context, parentState);
        let previousContext = localContext;
        let _startState = 86;
        this.enterRecursionRule(localContext, 86, QMongoParser.RULE_valueExpr, _p);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 461;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QMongoParser.MINUS_OP:
                {
                localContext = new UnaryMinusExprContext(localContext);
                this.context = localContext;
                previousContext = localContext;

                this.state = 450;
                this.match(QMongoParser.MINUS_OP);
                this.state = 451;
                this.valueExpr(7);
                }
                break;
            case QMongoParser.NOW:
            case QMongoParser.IDENTIFIER:
                {
                localContext = new FuncExprContext(localContext);
                this.context = localContext;
                previousContext = localContext;
                this.state = 452;
                this.exprFunc();
                }
                break;
            case QMongoParser.FIELD_REF:
                {
                localContext = new FieldRefExprContext(localContext);
                this.context = localContext;
                previousContext = localContext;
                this.state = 453;
                this.match(QMongoParser.FIELD_REF);
                }
                break;
            case QMongoParser.NUMBER:
                {
                localContext = new NumericExprContext(localContext);
                this.context = localContext;
                previousContext = localContext;
                this.state = 454;
                this.match(QMongoParser.NUMBER);
                }
                break;
            case QMongoParser.STRING:
                {
                localContext = new StringExprContext(localContext);
                this.context = localContext;
                previousContext = localContext;
                this.state = 455;
                this.match(QMongoParser.STRING);
                }
                break;
            case QMongoParser.BOOLEAN:
                {
                localContext = new BooleanExprContext(localContext);
                this.context = localContext;
                previousContext = localContext;
                this.state = 456;
                this.match(QMongoParser.BOOLEAN);
                }
                break;
            case QMongoParser.LPAREN:
                {
                localContext = new ParenValExprContext(localContext);
                this.context = localContext;
                previousContext = localContext;
                this.state = 457;
                this.match(QMongoParser.LPAREN);
                this.state = 458;
                this.valueExpr(0);
                this.state = 459;
                this.match(QMongoParser.RPAREN);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
            this.context!.stop = this.tokenStream.LT(-1);
            this.state = 471;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 40, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    if (this.parseListeners != null) {
                        this.triggerExitRuleEvent();
                    }
                    previousContext = localContext;
                    {
                    this.state = 469;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 39, this.context) ) {
                    case 1:
                        {
                        localContext = new MulDivExprContext(new ValueExprContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, QMongoParser.RULE_valueExpr);
                        this.state = 463;
                        if (!(this.precpred(this.context, 9))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 9)");
                        }
                        this.state = 464;
                        _la = this.tokenStream.LA(1);
                        if(!(((((_la - 54)) & ~0x1F) === 0 && ((1 << (_la - 54)) & 7) !== 0))) {
                        this.errorHandler.recoverInline(this);
                        }
                        else {
                            this.errorHandler.reportMatch(this);
                            this.consume();
                        }
                        this.state = 465;
                        this.valueExpr(10);
                        }
                        break;
                    case 2:
                        {
                        localContext = new AddSubExprContext(new ValueExprContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, QMongoParser.RULE_valueExpr);
                        this.state = 466;
                        if (!(this.precpred(this.context, 8))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 8)");
                        }
                        this.state = 467;
                        _la = this.tokenStream.LA(1);
                        if(!(_la === 52 || _la === 53)) {
                        this.errorHandler.recoverInline(this);
                        }
                        else {
                            this.errorHandler.reportMatch(this);
                            this.consume();
                        }
                        this.state = 468;
                        this.valueExpr(9);
                        }
                        break;
                    }
                    }
                }
                this.state = 473;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 40, this.context);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.unrollRecursionContexts(parentContext);
        }
        return localContext;
    }
    public exprFunc(): ExprFuncContext {
        let localContext = new ExprFuncContext(this.context, this.state);
        this.enterRule(localContext, 88, QMongoParser.RULE_exprFunc);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 474;
            _la = this.tokenStream.LA(1);
            if(!(_la === 38 || _la === 69)) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            this.state = 475;
            this.match(QMongoParser.LPAREN);
            this.state = 484;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 38)) & ~0x1F) === 0 && ((1 << (_la - 38)) & 4034953281) !== 0)) {
                {
                this.state = 476;
                this.valueExpr(0);
                this.state = 481;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 63) {
                    {
                    {
                    this.state = 477;
                    this.match(QMongoParser.COMMA);
                    this.state = 478;
                    this.valueExpr(0);
                    }
                    }
                    this.state = 483;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
            }

            this.state = 486;
            this.match(QMongoParser.RPAREN);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public literal(): LiteralContext {
        let localContext = new LiteralContext(this.context, this.state);
        this.enterRule(localContext, 90, QMongoParser.RULE_literal);
        let _la: number;
        try {
            this.state = 497;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case QMongoParser.MINUS_OP:
            case QMongoParser.NUMBER:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 489;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 53) {
                    {
                    this.state = 488;
                    this.match(QMongoParser.MINUS_OP);
                    }
                }

                this.state = 491;
                this.match(QMongoParser.NUMBER);
                }
                break;
            case QMongoParser.STRING:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 492;
                this.match(QMongoParser.STRING);
                }
                break;
            case QMongoParser.BOOLEAN:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 493;
                this.match(QMongoParser.BOOLEAN);
                }
                break;
            case QMongoParser.LBRACKET:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 494;
                this.array();
                }
                break;
            case QMongoParser.NOW:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 495;
                this.functionCall();
                }
                break;
            case QMongoParser.IDENTIFIER:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 496;
                this.match(QMongoParser.IDENTIFIER);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public stringLiteral(): StringLiteralContext {
        let localContext = new StringLiteralContext(this.context, this.state);
        this.enterRule(localContext, 92, QMongoParser.RULE_stringLiteral);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 499;
            this.match(QMongoParser.STRING);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public array(): ArrayContext {
        let localContext = new ArrayContext(this.context, this.state);
        this.enterRule(localContext, 94, QMongoParser.RULE_array);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 501;
            this.match(QMongoParser.LBRACKET);
            this.state = 510;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 38)) & ~0x1F) === 0 && ((1 << (_la - 38)) & 2954920001) !== 0)) {
                {
                this.state = 502;
                this.literal();
                this.state = 507;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 63) {
                    {
                    {
                    this.state = 503;
                    this.match(QMongoParser.COMMA);
                    this.state = 504;
                    this.literal();
                    }
                    }
                    this.state = 509;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
            }

            this.state = 512;
            this.match(QMongoParser.RBRACKET);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public functionCall(): FunctionCallContext {
        let localContext = new FunctionCallContext(this.context, this.state);
        this.enterRule(localContext, 96, QMongoParser.RULE_functionCall);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 514;
            this.match(QMongoParser.NOW);
            this.state = 515;
            this.match(QMongoParser.LPAREN);
            this.state = 516;
            this.match(QMongoParser.RPAREN);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }

    public override sempred(localContext: antlr.ParserRuleContext | null, ruleIndex: number, predIndex: number): boolean {
        switch (ruleIndex) {
        case 43:
            return this.valueExpr_sempred(localContext as ValueExprContext, predIndex);
        }
        return true;
    }
    private valueExpr_sempred(localContext: ValueExprContext | null, predIndex: number): boolean {
        switch (predIndex) {
        case 0:
            return this.precpred(this.context, 9);
        case 1:
            return this.precpred(this.context, 8);
        }
        return true;
    }

    public static readonly _serializedATN: number[] = [
        4,1,71,519,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,
        6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,
        2,14,7,14,2,15,7,15,2,16,7,16,2,17,7,17,2,18,7,18,2,19,7,19,2,20,
        7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,7,24,2,25,7,25,2,26,7,26,
        2,27,7,27,2,28,7,28,2,29,7,29,2,30,7,30,2,31,7,31,2,32,7,32,2,33,
        7,33,2,34,7,34,2,35,7,35,2,36,7,36,2,37,7,37,2,38,7,38,2,39,7,39,
        2,40,7,40,2,41,7,41,2,42,7,42,2,43,7,43,2,44,7,44,2,45,7,45,2,46,
        7,46,2,47,7,47,2,48,7,48,1,0,5,0,100,8,0,10,0,12,0,103,9,0,1,0,1,
        0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,1,114,8,1,1,2,1,2,1,2,1,2,1,2,1,
        3,1,3,1,3,3,3,124,8,3,1,3,3,3,127,8,3,1,3,5,3,130,8,3,10,3,12,3,
        133,9,3,1,3,3,3,136,8,3,1,3,3,3,139,8,3,1,3,3,3,142,8,3,1,4,1,4,
        1,4,1,5,1,5,1,5,1,6,1,6,1,6,5,6,153,8,6,10,6,12,6,156,9,6,1,7,1,
        7,1,7,1,7,1,7,1,7,3,7,164,8,7,1,8,3,8,167,8,8,1,8,3,8,170,8,8,1,
        8,3,8,173,8,8,1,8,3,8,176,8,8,1,8,5,8,179,8,8,10,8,12,8,182,9,8,
        1,9,1,9,1,9,1,9,1,9,5,9,189,8,9,10,9,12,9,192,9,9,1,10,1,10,3,10,
        196,8,10,1,11,1,11,1,11,1,12,1,12,1,12,1,13,1,13,1,13,1,13,1,13,
        1,13,1,13,1,14,1,14,1,14,5,14,214,8,14,10,14,12,14,217,9,14,1,15,
        1,15,1,15,1,15,1,16,1,16,1,16,1,16,1,16,1,17,1,17,1,17,1,17,1,17,
        1,18,1,18,1,18,5,18,236,8,18,10,18,12,18,239,9,18,1,19,1,19,1,19,
        1,19,3,19,245,8,19,1,20,1,20,1,20,1,20,1,20,1,21,1,21,1,21,1,21,
        1,21,1,21,1,22,3,22,259,8,22,1,22,5,22,262,8,22,10,22,12,22,265,
        9,22,1,22,3,22,268,8,22,1,22,3,22,271,8,22,1,22,3,22,274,8,22,1,
        22,3,22,277,8,22,1,23,1,23,1,23,1,24,1,24,1,24,1,24,1,24,1,24,1,
        24,1,25,1,25,1,25,5,25,292,8,25,10,25,12,25,295,9,25,1,26,1,26,1,
        26,1,26,1,26,1,26,1,26,1,27,1,27,1,27,5,27,307,8,27,10,27,12,27,
        310,9,27,1,28,1,28,1,28,1,28,1,29,1,29,1,29,1,29,1,29,1,29,1,29,
        1,29,1,29,1,29,1,29,1,29,1,29,1,29,1,29,1,29,1,29,1,29,1,29,3,29,
        335,8,29,1,30,1,30,1,30,1,31,1,31,1,31,1,31,5,31,344,8,31,10,31,
        12,31,347,9,31,1,32,1,32,3,32,351,8,32,1,33,1,33,1,33,1,33,1,33,
        1,33,1,34,5,34,360,8,34,10,34,12,34,363,9,34,1,35,1,35,1,35,1,35,
        1,35,1,35,1,35,1,35,3,35,373,8,35,1,36,1,36,1,37,1,37,1,37,5,37,
        380,8,37,10,37,12,37,383,9,37,1,38,1,38,1,38,5,38,388,8,38,10,38,
        12,38,391,9,38,1,39,1,39,1,39,3,39,396,8,39,1,40,1,40,1,40,1,40,
        1,40,3,40,403,8,40,1,41,1,41,1,41,1,41,1,41,1,41,1,41,1,41,1,41,
        1,41,1,41,1,41,1,41,1,41,1,41,1,41,1,41,1,41,1,41,1,41,1,41,1,41,
        1,41,1,41,1,41,1,41,1,41,1,41,1,41,1,41,1,41,1,41,1,41,1,41,1,41,
        1,41,1,41,1,41,1,41,1,41,1,41,3,41,446,8,41,1,42,1,42,1,43,1,43,
        1,43,1,43,1,43,1,43,1,43,1,43,1,43,1,43,1,43,1,43,3,43,462,8,43,
        1,43,1,43,1,43,1,43,1,43,1,43,5,43,470,8,43,10,43,12,43,473,9,43,
        1,44,1,44,1,44,1,44,1,44,5,44,480,8,44,10,44,12,44,483,9,44,3,44,
        485,8,44,1,44,1,44,1,45,3,45,490,8,45,1,45,1,45,1,45,1,45,1,45,1,
        45,3,45,498,8,45,1,46,1,46,1,47,1,47,1,47,1,47,5,47,506,8,47,10,
        47,12,47,509,9,47,3,47,511,8,47,1,47,1,47,1,48,1,48,1,48,1,48,1,
        48,0,1,86,49,0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,
        38,40,42,44,46,48,50,52,54,56,58,60,62,64,66,68,70,72,74,76,78,80,
        82,84,86,88,90,92,94,96,0,6,1,0,8,9,2,0,66,66,69,69,1,0,45,50,1,
        0,54,56,1,0,52,53,2,0,38,38,69,69,543,0,101,1,0,0,0,2,113,1,0,0,
        0,4,115,1,0,0,0,6,120,1,0,0,0,8,143,1,0,0,0,10,146,1,0,0,0,12,149,
        1,0,0,0,14,157,1,0,0,0,16,166,1,0,0,0,18,183,1,0,0,0,20,193,1,0,
        0,0,22,197,1,0,0,0,24,200,1,0,0,0,26,203,1,0,0,0,28,210,1,0,0,0,
        30,218,1,0,0,0,32,222,1,0,0,0,34,227,1,0,0,0,36,232,1,0,0,0,38,240,
        1,0,0,0,40,246,1,0,0,0,42,251,1,0,0,0,44,258,1,0,0,0,46,278,1,0,
        0,0,48,281,1,0,0,0,50,288,1,0,0,0,52,296,1,0,0,0,54,303,1,0,0,0,
        56,311,1,0,0,0,58,334,1,0,0,0,60,336,1,0,0,0,62,339,1,0,0,0,64,348,
        1,0,0,0,66,352,1,0,0,0,68,361,1,0,0,0,70,372,1,0,0,0,72,374,1,0,
        0,0,74,376,1,0,0,0,76,384,1,0,0,0,78,395,1,0,0,0,80,402,1,0,0,0,
        82,445,1,0,0,0,84,447,1,0,0,0,86,461,1,0,0,0,88,474,1,0,0,0,90,497,
        1,0,0,0,92,499,1,0,0,0,94,501,1,0,0,0,96,514,1,0,0,0,98,100,3,2,
        1,0,99,98,1,0,0,0,100,103,1,0,0,0,101,99,1,0,0,0,101,102,1,0,0,0,
        102,104,1,0,0,0,103,101,1,0,0,0,104,105,5,0,0,1,105,1,1,0,0,0,106,
        114,3,4,2,0,107,114,3,6,3,0,108,114,3,26,13,0,109,114,3,32,16,0,
        110,114,3,40,20,0,111,114,3,42,21,0,112,114,3,66,33,0,113,106,1,
        0,0,0,113,107,1,0,0,0,113,108,1,0,0,0,113,109,1,0,0,0,113,110,1,
        0,0,0,113,111,1,0,0,0,113,112,1,0,0,0,114,3,1,0,0,0,115,116,5,1,
        0,0,116,117,5,69,0,0,117,118,5,51,0,0,118,119,3,90,45,0,119,5,1,
        0,0,0,120,121,5,2,0,0,121,123,5,69,0,0,122,124,3,8,4,0,123,122,1,
        0,0,0,123,124,1,0,0,0,124,126,1,0,0,0,125,127,3,10,5,0,126,125,1,
        0,0,0,126,127,1,0,0,0,127,131,1,0,0,0,128,130,3,14,7,0,129,128,1,
        0,0,0,130,133,1,0,0,0,131,129,1,0,0,0,131,132,1,0,0,0,132,135,1,
        0,0,0,133,131,1,0,0,0,134,136,3,18,9,0,135,134,1,0,0,0,135,136,1,
        0,0,0,136,138,1,0,0,0,137,139,3,22,11,0,138,137,1,0,0,0,138,139,
        1,0,0,0,139,141,1,0,0,0,140,142,3,24,12,0,141,140,1,0,0,0,141,142,
        1,0,0,0,142,7,1,0,0,0,143,144,5,3,0,0,144,145,3,72,36,0,145,9,1,
        0,0,0,146,147,5,4,0,0,147,148,3,12,6,0,148,11,1,0,0,0,149,154,5,
        69,0,0,150,151,5,63,0,0,151,153,5,69,0,0,152,150,1,0,0,0,153,156,
        1,0,0,0,154,152,1,0,0,0,154,155,1,0,0,0,155,13,1,0,0,0,156,154,1,
        0,0,0,157,158,5,5,0,0,158,163,5,69,0,0,159,160,5,57,0,0,160,161,
        3,16,8,0,161,162,5,58,0,0,162,164,1,0,0,0,163,159,1,0,0,0,163,164,
        1,0,0,0,164,15,1,0,0,0,165,167,3,8,4,0,166,165,1,0,0,0,166,167,1,
        0,0,0,167,169,1,0,0,0,168,170,3,10,5,0,169,168,1,0,0,0,169,170,1,
        0,0,0,170,172,1,0,0,0,171,173,3,18,9,0,172,171,1,0,0,0,172,173,1,
        0,0,0,173,175,1,0,0,0,174,176,3,22,11,0,175,174,1,0,0,0,175,176,
        1,0,0,0,176,180,1,0,0,0,177,179,3,14,7,0,178,177,1,0,0,0,179,182,
        1,0,0,0,180,178,1,0,0,0,180,181,1,0,0,0,181,17,1,0,0,0,182,180,1,
        0,0,0,183,184,5,6,0,0,184,185,5,7,0,0,185,190,3,20,10,0,186,187,
        5,63,0,0,187,189,3,20,10,0,188,186,1,0,0,0,189,192,1,0,0,0,190,188,
        1,0,0,0,190,191,1,0,0,0,191,19,1,0,0,0,192,190,1,0,0,0,193,195,5,
        69,0,0,194,196,7,0,0,0,195,194,1,0,0,0,195,196,1,0,0,0,196,21,1,
        0,0,0,197,198,5,10,0,0,198,199,7,1,0,0,199,23,1,0,0,0,200,201,5,
        11,0,0,201,202,7,1,0,0,202,25,1,0,0,0,203,204,5,12,0,0,204,205,5,
        13,0,0,205,206,5,69,0,0,206,207,5,57,0,0,207,208,3,28,14,0,208,209,
        5,58,0,0,209,27,1,0,0,0,210,215,3,30,15,0,211,212,5,63,0,0,212,214,
        3,30,15,0,213,211,1,0,0,0,214,217,1,0,0,0,215,213,1,0,0,0,215,216,
        1,0,0,0,216,29,1,0,0,0,217,215,1,0,0,0,218,219,5,69,0,0,219,220,
        5,65,0,0,220,221,3,90,45,0,221,31,1,0,0,0,222,223,5,14,0,0,223,224,
        5,69,0,0,224,225,3,8,4,0,225,226,3,34,17,0,226,33,1,0,0,0,227,228,
        5,15,0,0,228,229,5,57,0,0,229,230,3,36,18,0,230,231,5,58,0,0,231,
        35,1,0,0,0,232,237,3,38,19,0,233,234,5,63,0,0,234,236,3,38,19,0,
        235,233,1,0,0,0,236,239,1,0,0,0,237,235,1,0,0,0,237,238,1,0,0,0,
        238,37,1,0,0,0,239,237,1,0,0,0,240,241,5,69,0,0,241,244,5,51,0,0,
        242,245,3,90,45,0,243,245,3,96,48,0,244,242,1,0,0,0,244,243,1,0,
        0,0,245,39,1,0,0,0,246,247,5,16,0,0,247,248,5,2,0,0,248,249,5,69,
        0,0,249,250,3,8,4,0,250,41,1,0,0,0,251,252,5,17,0,0,252,253,5,69,
        0,0,253,254,5,57,0,0,254,255,3,44,22,0,255,256,5,58,0,0,256,43,1,
        0,0,0,257,259,3,46,23,0,258,257,1,0,0,0,258,259,1,0,0,0,259,263,
        1,0,0,0,260,262,3,48,24,0,261,260,1,0,0,0,262,265,1,0,0,0,263,261,
        1,0,0,0,263,264,1,0,0,0,264,267,1,0,0,0,265,263,1,0,0,0,266,268,
        3,52,26,0,267,266,1,0,0,0,267,268,1,0,0,0,268,270,1,0,0,0,269,271,
        3,60,30,0,270,269,1,0,0,0,270,271,1,0,0,0,271,273,1,0,0,0,272,274,
        3,62,31,0,273,272,1,0,0,0,273,274,1,0,0,0,274,276,1,0,0,0,275,277,
        3,22,11,0,276,275,1,0,0,0,276,277,1,0,0,0,277,45,1,0,0,0,278,279,
        5,18,0,0,279,280,3,72,36,0,280,47,1,0,0,0,281,282,5,22,0,0,282,283,
        5,69,0,0,283,284,5,23,0,0,284,285,3,50,25,0,285,286,5,45,0,0,286,
        287,3,50,25,0,287,49,1,0,0,0,288,293,5,69,0,0,289,290,5,64,0,0,290,
        292,5,69,0,0,291,289,1,0,0,0,292,295,1,0,0,0,293,291,1,0,0,0,293,
        294,1,0,0,0,294,51,1,0,0,0,295,293,1,0,0,0,296,297,5,19,0,0,297,
        298,5,7,0,0,298,299,5,69,0,0,299,300,5,57,0,0,300,301,3,54,27,0,
        301,302,5,58,0,0,302,53,1,0,0,0,303,308,3,56,28,0,304,305,5,63,0,
        0,305,307,3,56,28,0,306,304,1,0,0,0,307,310,1,0,0,0,308,306,1,0,
        0,0,308,309,1,0,0,0,309,55,1,0,0,0,310,308,1,0,0,0,311,312,5,69,
        0,0,312,313,5,51,0,0,313,314,3,58,29,0,314,57,1,0,0,0,315,316,5,
        39,0,0,316,317,5,61,0,0,317,335,5,62,0,0,318,319,5,40,0,0,319,320,
        5,61,0,0,320,321,5,69,0,0,321,335,5,62,0,0,322,323,5,41,0,0,323,
        324,5,61,0,0,324,325,5,69,0,0,325,335,5,62,0,0,326,327,5,42,0,0,
        327,328,5,61,0,0,328,329,5,69,0,0,329,335,5,62,0,0,330,331,5,43,
        0,0,331,332,5,61,0,0,332,333,5,69,0,0,333,335,5,62,0,0,334,315,1,
        0,0,0,334,318,1,0,0,0,334,322,1,0,0,0,334,326,1,0,0,0,334,330,1,
        0,0,0,335,59,1,0,0,0,336,337,5,20,0,0,337,338,3,72,36,0,338,61,1,
        0,0,0,339,340,5,21,0,0,340,345,3,64,32,0,341,342,5,63,0,0,342,344,
        3,64,32,0,343,341,1,0,0,0,344,347,1,0,0,0,345,343,1,0,0,0,345,346,
        1,0,0,0,346,63,1,0,0,0,347,345,1,0,0,0,348,350,5,69,0,0,349,351,
        7,0,0,0,350,349,1,0,0,0,350,351,1,0,0,0,351,65,1,0,0,0,352,353,5,
        24,0,0,353,354,5,69,0,0,354,355,5,57,0,0,355,356,3,68,34,0,356,357,
        5,58,0,0,357,67,1,0,0,0,358,360,3,70,35,0,359,358,1,0,0,0,360,363,
        1,0,0,0,361,359,1,0,0,0,361,362,1,0,0,0,362,69,1,0,0,0,363,361,1,
        0,0,0,364,365,5,25,0,0,365,373,5,66,0,0,366,367,5,26,0,0,367,368,
        5,28,0,0,368,373,3,12,6,0,369,370,5,27,0,0,370,371,5,28,0,0,371,
        373,3,12,6,0,372,364,1,0,0,0,372,366,1,0,0,0,372,369,1,0,0,0,373,
        71,1,0,0,0,374,375,3,74,37,0,375,73,1,0,0,0,376,381,3,76,38,0,377,
        378,5,31,0,0,378,380,3,76,38,0,379,377,1,0,0,0,380,383,1,0,0,0,381,
        379,1,0,0,0,381,382,1,0,0,0,382,75,1,0,0,0,383,381,1,0,0,0,384,389,
        3,78,39,0,385,386,5,30,0,0,386,388,3,78,39,0,387,385,1,0,0,0,388,
        391,1,0,0,0,389,387,1,0,0,0,389,390,1,0,0,0,390,77,1,0,0,0,391,389,
        1,0,0,0,392,393,5,32,0,0,393,396,3,78,39,0,394,396,3,80,40,0,395,
        392,1,0,0,0,395,394,1,0,0,0,396,79,1,0,0,0,397,398,5,61,0,0,398,
        399,3,72,36,0,399,400,5,62,0,0,400,403,1,0,0,0,401,403,3,82,41,0,
        402,397,1,0,0,0,402,401,1,0,0,0,403,81,1,0,0,0,404,405,5,69,0,0,
        405,406,3,84,42,0,406,407,3,90,45,0,407,446,1,0,0,0,408,409,5,69,
        0,0,409,410,3,84,42,0,410,411,5,69,0,0,411,446,1,0,0,0,412,413,5,
        69,0,0,413,414,5,33,0,0,414,446,3,94,47,0,415,416,5,69,0,0,416,417,
        5,33,0,0,417,446,5,69,0,0,418,419,5,69,0,0,419,420,5,32,0,0,420,
        421,5,33,0,0,421,446,3,94,47,0,422,423,5,69,0,0,423,424,5,32,0,0,
        424,425,5,33,0,0,425,446,5,69,0,0,426,427,5,69,0,0,427,428,5,34,
        0,0,428,429,3,90,45,0,429,430,5,30,0,0,430,431,3,90,45,0,431,446,
        1,0,0,0,432,433,5,69,0,0,433,434,5,35,0,0,434,446,3,92,46,0,435,
        436,5,69,0,0,436,437,5,36,0,0,437,446,3,92,46,0,438,439,5,69,0,0,
        439,440,5,37,0,0,440,446,3,92,46,0,441,442,3,86,43,0,442,443,3,84,
        42,0,443,444,3,86,43,0,444,446,1,0,0,0,445,404,1,0,0,0,445,408,1,
        0,0,0,445,412,1,0,0,0,445,415,1,0,0,0,445,418,1,0,0,0,445,422,1,
        0,0,0,445,426,1,0,0,0,445,432,1,0,0,0,445,435,1,0,0,0,445,438,1,
        0,0,0,445,441,1,0,0,0,446,83,1,0,0,0,447,448,7,2,0,0,448,85,1,0,
        0,0,449,450,6,43,-1,0,450,451,5,53,0,0,451,462,3,86,43,7,452,462,
        3,88,44,0,453,462,5,68,0,0,454,462,5,66,0,0,455,462,5,67,0,0,456,
        462,5,44,0,0,457,458,5,61,0,0,458,459,3,86,43,0,459,460,5,62,0,0,
        460,462,1,0,0,0,461,449,1,0,0,0,461,452,1,0,0,0,461,453,1,0,0,0,
        461,454,1,0,0,0,461,455,1,0,0,0,461,456,1,0,0,0,461,457,1,0,0,0,
        462,471,1,0,0,0,463,464,10,9,0,0,464,465,7,3,0,0,465,470,3,86,43,
        10,466,467,10,8,0,0,467,468,7,4,0,0,468,470,3,86,43,9,469,463,1,
        0,0,0,469,466,1,0,0,0,470,473,1,0,0,0,471,469,1,0,0,0,471,472,1,
        0,0,0,472,87,1,0,0,0,473,471,1,0,0,0,474,475,7,5,0,0,475,484,5,61,
        0,0,476,481,3,86,43,0,477,478,5,63,0,0,478,480,3,86,43,0,479,477,
        1,0,0,0,480,483,1,0,0,0,481,479,1,0,0,0,481,482,1,0,0,0,482,485,
        1,0,0,0,483,481,1,0,0,0,484,476,1,0,0,0,484,485,1,0,0,0,485,486,
        1,0,0,0,486,487,5,62,0,0,487,89,1,0,0,0,488,490,5,53,0,0,489,488,
        1,0,0,0,489,490,1,0,0,0,490,491,1,0,0,0,491,498,5,66,0,0,492,498,
        5,67,0,0,493,498,5,44,0,0,494,498,3,94,47,0,495,498,3,96,48,0,496,
        498,5,69,0,0,497,489,1,0,0,0,497,492,1,0,0,0,497,493,1,0,0,0,497,
        494,1,0,0,0,497,495,1,0,0,0,497,496,1,0,0,0,498,91,1,0,0,0,499,500,
        5,67,0,0,500,93,1,0,0,0,501,510,5,59,0,0,502,507,3,90,45,0,503,504,
        5,63,0,0,504,506,3,90,45,0,505,503,1,0,0,0,506,509,1,0,0,0,507,505,
        1,0,0,0,507,508,1,0,0,0,508,511,1,0,0,0,509,507,1,0,0,0,510,502,
        1,0,0,0,510,511,1,0,0,0,511,512,1,0,0,0,512,513,5,60,0,0,513,95,
        1,0,0,0,514,515,5,38,0,0,515,516,5,61,0,0,516,517,5,62,0,0,517,97,
        1,0,0,0,47,101,113,123,126,131,135,138,141,154,163,166,169,172,175,
        180,190,195,215,237,244,258,263,267,270,273,276,293,308,334,345,
        350,361,372,381,389,395,402,445,461,469,471,481,484,489,497,507,
        510
    ];

    private static __ATN: antlr.ATN;
    public static get _ATN(): antlr.ATN {
        if (!QMongoParser.__ATN) {
            QMongoParser.__ATN = new antlr.ATNDeserializer().deserialize(QMongoParser._serializedATN);
        }

        return QMongoParser.__ATN;
    }


    private static readonly vocabulary = new antlr.Vocabulary(QMongoParser.literalNames, QMongoParser.symbolicNames, []);

    public override get vocabulary(): antlr.Vocabulary {
        return QMongoParser.vocabulary;
    }

    private static readonly decisionsToDFA = QMongoParser._ATN.decisionToState.map( (ds: antlr.DecisionState, index: number) => new antlr.DFA(ds, index) );
}

export class ProgramContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public EOF(): antlr.TerminalNode {
        return this.getToken(QMongoParser.EOF, 0)!;
    }
    public statement(): StatementContext[];
    public statement(i: number): StatementContext | null;
    public statement(i?: number): StatementContext[] | StatementContext | null {
        if (i === undefined) {
            return this.getRuleContexts(StatementContext);
        }

        return this.getRuleContext(i, StatementContext);
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_program;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitProgram) {
            return visitor.visitProgram(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class StatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public letStatement(): LetStatementContext | null {
        return this.getRuleContext(0, LetStatementContext);
    }
    public fromStatement(): FromStatementContext | null {
        return this.getRuleContext(0, FromStatementContext);
    }
    public insertStatement(): InsertStatementContext | null {
        return this.getRuleContext(0, InsertStatementContext);
    }
    public updateStatement(): UpdateStatementContext | null {
        return this.getRuleContext(0, UpdateStatementContext);
    }
    public deleteStatement(): DeleteStatementContext | null {
        return this.getRuleContext(0, DeleteStatementContext);
    }
    public aggregateStatement(): AggregateStatementContext | null {
        return this.getRuleContext(0, AggregateStatementContext);
    }
    public policyStatement(): PolicyStatementContext | null {
        return this.getRuleContext(0, PolicyStatementContext);
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_statement;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitStatement) {
            return visitor.visitStatement(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class LetStatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LET(): antlr.TerminalNode {
        return this.getToken(QMongoParser.LET, 0)!;
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(QMongoParser.IDENTIFIER, 0)!;
    }
    public ASSIGN(): antlr.TerminalNode {
        return this.getToken(QMongoParser.ASSIGN, 0)!;
    }
    public literal(): LiteralContext {
        return this.getRuleContext(0, LiteralContext)!;
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_letStatement;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitLetStatement) {
            return visitor.visitLetStatement(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class FromStatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public FROM(): antlr.TerminalNode {
        return this.getToken(QMongoParser.FROM, 0)!;
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(QMongoParser.IDENTIFIER, 0)!;
    }
    public whereClause(): WhereClauseContext | null {
        return this.getRuleContext(0, WhereClauseContext);
    }
    public selectClause(): SelectClauseContext | null {
        return this.getRuleContext(0, SelectClauseContext);
    }
    public includeClause(): IncludeClauseContext[];
    public includeClause(i: number): IncludeClauseContext | null;
    public includeClause(i?: number): IncludeClauseContext[] | IncludeClauseContext | null {
        if (i === undefined) {
            return this.getRuleContexts(IncludeClauseContext);
        }

        return this.getRuleContext(i, IncludeClauseContext);
    }
    public orderByClause(): OrderByClauseContext | null {
        return this.getRuleContext(0, OrderByClauseContext);
    }
    public limitClause(): LimitClauseContext | null {
        return this.getRuleContext(0, LimitClauseContext);
    }
    public offsetClause(): OffsetClauseContext | null {
        return this.getRuleContext(0, OffsetClauseContext);
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_fromStatement;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitFromStatement) {
            return visitor.visitFromStatement(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class WhereClauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public WHERE(): antlr.TerminalNode {
        return this.getToken(QMongoParser.WHERE, 0)!;
    }
    public expression(): ExpressionContext {
        return this.getRuleContext(0, ExpressionContext)!;
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_whereClause;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitWhereClause) {
            return visitor.visitWhereClause(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SelectClauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public SELECT(): antlr.TerminalNode {
        return this.getToken(QMongoParser.SELECT, 0)!;
    }
    public fieldList(): FieldListContext {
        return this.getRuleContext(0, FieldListContext)!;
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_selectClause;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitSelectClause) {
            return visitor.visitSelectClause(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class FieldListContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IDENTIFIER(): antlr.TerminalNode[];
    public IDENTIFIER(i: number): antlr.TerminalNode | null;
    public IDENTIFIER(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QMongoParser.IDENTIFIER);
    	} else {
    		return this.getToken(QMongoParser.IDENTIFIER, i);
    	}
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QMongoParser.COMMA);
    	} else {
    		return this.getToken(QMongoParser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_fieldList;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitFieldList) {
            return visitor.visitFieldList(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class IncludeClauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public INCLUDE(): antlr.TerminalNode {
        return this.getToken(QMongoParser.INCLUDE, 0)!;
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(QMongoParser.IDENTIFIER, 0)!;
    }
    public LBRACE(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.LBRACE, 0);
    }
    public includeBody(): IncludeBodyContext | null {
        return this.getRuleContext(0, IncludeBodyContext);
    }
    public RBRACE(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.RBRACE, 0);
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_includeClause;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitIncludeClause) {
            return visitor.visitIncludeClause(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class IncludeBodyContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public whereClause(): WhereClauseContext | null {
        return this.getRuleContext(0, WhereClauseContext);
    }
    public selectClause(): SelectClauseContext | null {
        return this.getRuleContext(0, SelectClauseContext);
    }
    public orderByClause(): OrderByClauseContext | null {
        return this.getRuleContext(0, OrderByClauseContext);
    }
    public limitClause(): LimitClauseContext | null {
        return this.getRuleContext(0, LimitClauseContext);
    }
    public includeClause(): IncludeClauseContext[];
    public includeClause(i: number): IncludeClauseContext | null;
    public includeClause(i?: number): IncludeClauseContext[] | IncludeClauseContext | null {
        if (i === undefined) {
            return this.getRuleContexts(IncludeClauseContext);
        }

        return this.getRuleContext(i, IncludeClauseContext);
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_includeBody;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitIncludeBody) {
            return visitor.visitIncludeBody(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class OrderByClauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ORDER(): antlr.TerminalNode {
        return this.getToken(QMongoParser.ORDER, 0)!;
    }
    public BY(): antlr.TerminalNode {
        return this.getToken(QMongoParser.BY, 0)!;
    }
    public orderField(): OrderFieldContext[];
    public orderField(i: number): OrderFieldContext | null;
    public orderField(i?: number): OrderFieldContext[] | OrderFieldContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OrderFieldContext);
        }

        return this.getRuleContext(i, OrderFieldContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QMongoParser.COMMA);
    	} else {
    		return this.getToken(QMongoParser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_orderByClause;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitOrderByClause) {
            return visitor.visitOrderByClause(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class OrderFieldContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(QMongoParser.IDENTIFIER, 0)!;
    }
    public ASC(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.ASC, 0);
    }
    public DESC(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.DESC, 0);
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_orderField;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitOrderField) {
            return visitor.visitOrderField(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class LimitClauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LIMIT(): antlr.TerminalNode {
        return this.getToken(QMongoParser.LIMIT, 0)!;
    }
    public NUMBER(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.NUMBER, 0);
    }
    public IDENTIFIER(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.IDENTIFIER, 0);
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_limitClause;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitLimitClause) {
            return visitor.visitLimitClause(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class OffsetClauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public OFFSET(): antlr.TerminalNode {
        return this.getToken(QMongoParser.OFFSET, 0)!;
    }
    public NUMBER(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.NUMBER, 0);
    }
    public IDENTIFIER(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.IDENTIFIER, 0);
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_offsetClause;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitOffsetClause) {
            return visitor.visitOffsetClause(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class InsertStatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public INSERT(): antlr.TerminalNode {
        return this.getToken(QMongoParser.INSERT, 0)!;
    }
    public INTO(): antlr.TerminalNode {
        return this.getToken(QMongoParser.INTO, 0)!;
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(QMongoParser.IDENTIFIER, 0)!;
    }
    public LBRACE(): antlr.TerminalNode {
        return this.getToken(QMongoParser.LBRACE, 0)!;
    }
    public insertFieldList(): InsertFieldListContext {
        return this.getRuleContext(0, InsertFieldListContext)!;
    }
    public RBRACE(): antlr.TerminalNode {
        return this.getToken(QMongoParser.RBRACE, 0)!;
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_insertStatement;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitInsertStatement) {
            return visitor.visitInsertStatement(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class InsertFieldListContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public insertField(): InsertFieldContext[];
    public insertField(i: number): InsertFieldContext | null;
    public insertField(i?: number): InsertFieldContext[] | InsertFieldContext | null {
        if (i === undefined) {
            return this.getRuleContexts(InsertFieldContext);
        }

        return this.getRuleContext(i, InsertFieldContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QMongoParser.COMMA);
    	} else {
    		return this.getToken(QMongoParser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_insertFieldList;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitInsertFieldList) {
            return visitor.visitInsertFieldList(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class InsertFieldContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(QMongoParser.IDENTIFIER, 0)!;
    }
    public COLON(): antlr.TerminalNode {
        return this.getToken(QMongoParser.COLON, 0)!;
    }
    public literal(): LiteralContext {
        return this.getRuleContext(0, LiteralContext)!;
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_insertField;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitInsertField) {
            return visitor.visitInsertField(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class UpdateStatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public UPDATE(): antlr.TerminalNode {
        return this.getToken(QMongoParser.UPDATE, 0)!;
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(QMongoParser.IDENTIFIER, 0)!;
    }
    public whereClause(): WhereClauseContext {
        return this.getRuleContext(0, WhereClauseContext)!;
    }
    public setClause(): SetClauseContext {
        return this.getRuleContext(0, SetClauseContext)!;
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_updateStatement;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitUpdateStatement) {
            return visitor.visitUpdateStatement(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SetClauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public SET(): antlr.TerminalNode {
        return this.getToken(QMongoParser.SET, 0)!;
    }
    public LBRACE(): antlr.TerminalNode {
        return this.getToken(QMongoParser.LBRACE, 0)!;
    }
    public setFieldList(): SetFieldListContext {
        return this.getRuleContext(0, SetFieldListContext)!;
    }
    public RBRACE(): antlr.TerminalNode {
        return this.getToken(QMongoParser.RBRACE, 0)!;
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_setClause;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitSetClause) {
            return visitor.visitSetClause(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SetFieldListContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public setField(): SetFieldContext[];
    public setField(i: number): SetFieldContext | null;
    public setField(i?: number): SetFieldContext[] | SetFieldContext | null {
        if (i === undefined) {
            return this.getRuleContexts(SetFieldContext);
        }

        return this.getRuleContext(i, SetFieldContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QMongoParser.COMMA);
    	} else {
    		return this.getToken(QMongoParser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_setFieldList;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitSetFieldList) {
            return visitor.visitSetFieldList(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SetFieldContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(QMongoParser.IDENTIFIER, 0)!;
    }
    public ASSIGN(): antlr.TerminalNode {
        return this.getToken(QMongoParser.ASSIGN, 0)!;
    }
    public literal(): LiteralContext | null {
        return this.getRuleContext(0, LiteralContext);
    }
    public functionCall(): FunctionCallContext | null {
        return this.getRuleContext(0, FunctionCallContext);
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_setField;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitSetField) {
            return visitor.visitSetField(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class DeleteStatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public DELETE(): antlr.TerminalNode {
        return this.getToken(QMongoParser.DELETE, 0)!;
    }
    public FROM(): antlr.TerminalNode {
        return this.getToken(QMongoParser.FROM, 0)!;
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(QMongoParser.IDENTIFIER, 0)!;
    }
    public whereClause(): WhereClauseContext {
        return this.getRuleContext(0, WhereClauseContext)!;
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_deleteStatement;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitDeleteStatement) {
            return visitor.visitDeleteStatement(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class AggregateStatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public AGGREGATE(): antlr.TerminalNode {
        return this.getToken(QMongoParser.AGGREGATE, 0)!;
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(QMongoParser.IDENTIFIER, 0)!;
    }
    public LBRACE(): antlr.TerminalNode {
        return this.getToken(QMongoParser.LBRACE, 0)!;
    }
    public aggregateBody(): AggregateBodyContext {
        return this.getRuleContext(0, AggregateBodyContext)!;
    }
    public RBRACE(): antlr.TerminalNode {
        return this.getToken(QMongoParser.RBRACE, 0)!;
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_aggregateStatement;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitAggregateStatement) {
            return visitor.visitAggregateStatement(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class AggregateBodyContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public matchClause(): MatchClauseContext | null {
        return this.getRuleContext(0, MatchClauseContext);
    }
    public lookupClause(): LookupClauseContext[];
    public lookupClause(i: number): LookupClauseContext | null;
    public lookupClause(i?: number): LookupClauseContext[] | LookupClauseContext | null {
        if (i === undefined) {
            return this.getRuleContexts(LookupClauseContext);
        }

        return this.getRuleContext(i, LookupClauseContext);
    }
    public groupByClause(): GroupByClauseContext | null {
        return this.getRuleContext(0, GroupByClauseContext);
    }
    public havingClause(): HavingClauseContext | null {
        return this.getRuleContext(0, HavingClauseContext);
    }
    public sortClause(): SortClauseContext | null {
        return this.getRuleContext(0, SortClauseContext);
    }
    public limitClause(): LimitClauseContext | null {
        return this.getRuleContext(0, LimitClauseContext);
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_aggregateBody;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitAggregateBody) {
            return visitor.visitAggregateBody(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class MatchClauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public MATCH(): antlr.TerminalNode {
        return this.getToken(QMongoParser.MATCH, 0)!;
    }
    public expression(): ExpressionContext {
        return this.getRuleContext(0, ExpressionContext)!;
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_matchClause;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitMatchClause) {
            return visitor.visitMatchClause(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class LookupClauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LOOKUP(): antlr.TerminalNode {
        return this.getToken(QMongoParser.LOOKUP, 0)!;
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(QMongoParser.IDENTIFIER, 0)!;
    }
    public ON(): antlr.TerminalNode {
        return this.getToken(QMongoParser.ON, 0)!;
    }
    public dotPath(): DotPathContext[];
    public dotPath(i: number): DotPathContext | null;
    public dotPath(i?: number): DotPathContext[] | DotPathContext | null {
        if (i === undefined) {
            return this.getRuleContexts(DotPathContext);
        }

        return this.getRuleContext(i, DotPathContext);
    }
    public EQ(): antlr.TerminalNode {
        return this.getToken(QMongoParser.EQ, 0)!;
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_lookupClause;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitLookupClause) {
            return visitor.visitLookupClause(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class DotPathContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IDENTIFIER(): antlr.TerminalNode[];
    public IDENTIFIER(i: number): antlr.TerminalNode | null;
    public IDENTIFIER(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QMongoParser.IDENTIFIER);
    	} else {
    		return this.getToken(QMongoParser.IDENTIFIER, i);
    	}
    }
    public DOT(): antlr.TerminalNode[];
    public DOT(i: number): antlr.TerminalNode | null;
    public DOT(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QMongoParser.DOT);
    	} else {
    		return this.getToken(QMongoParser.DOT, i);
    	}
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_dotPath;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitDotPath) {
            return visitor.visitDotPath(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class GroupByClauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public GROUP(): antlr.TerminalNode {
        return this.getToken(QMongoParser.GROUP, 0)!;
    }
    public BY(): antlr.TerminalNode {
        return this.getToken(QMongoParser.BY, 0)!;
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(QMongoParser.IDENTIFIER, 0)!;
    }
    public LBRACE(): antlr.TerminalNode {
        return this.getToken(QMongoParser.LBRACE, 0)!;
    }
    public groupFieldList(): GroupFieldListContext {
        return this.getRuleContext(0, GroupFieldListContext)!;
    }
    public RBRACE(): antlr.TerminalNode {
        return this.getToken(QMongoParser.RBRACE, 0)!;
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_groupByClause;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitGroupByClause) {
            return visitor.visitGroupByClause(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class GroupFieldListContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public groupField(): GroupFieldContext[];
    public groupField(i: number): GroupFieldContext | null;
    public groupField(i?: number): GroupFieldContext[] | GroupFieldContext | null {
        if (i === undefined) {
            return this.getRuleContexts(GroupFieldContext);
        }

        return this.getRuleContext(i, GroupFieldContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QMongoParser.COMMA);
    	} else {
    		return this.getToken(QMongoParser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_groupFieldList;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitGroupFieldList) {
            return visitor.visitGroupFieldList(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class GroupFieldContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(QMongoParser.IDENTIFIER, 0)!;
    }
    public ASSIGN(): antlr.TerminalNode {
        return this.getToken(QMongoParser.ASSIGN, 0)!;
    }
    public aggregateFunction(): AggregateFunctionContext {
        return this.getRuleContext(0, AggregateFunctionContext)!;
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_groupField;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitGroupField) {
            return visitor.visitGroupField(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class AggregateFunctionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public COUNT(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.COUNT, 0);
    }
    public LPAREN(): antlr.TerminalNode {
        return this.getToken(QMongoParser.LPAREN, 0)!;
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(QMongoParser.RPAREN, 0)!;
    }
    public SUM(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.SUM, 0);
    }
    public IDENTIFIER(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.IDENTIFIER, 0);
    }
    public AVG(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.AVG, 0);
    }
    public MIN_FUNC(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.MIN_FUNC, 0);
    }
    public MAX_FUNC(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.MAX_FUNC, 0);
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_aggregateFunction;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitAggregateFunction) {
            return visitor.visitAggregateFunction(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class HavingClauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public HAVING(): antlr.TerminalNode {
        return this.getToken(QMongoParser.HAVING, 0)!;
    }
    public expression(): ExpressionContext {
        return this.getRuleContext(0, ExpressionContext)!;
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_havingClause;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitHavingClause) {
            return visitor.visitHavingClause(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SortClauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public SORT(): antlr.TerminalNode {
        return this.getToken(QMongoParser.SORT, 0)!;
    }
    public sortField(): SortFieldContext[];
    public sortField(i: number): SortFieldContext | null;
    public sortField(i?: number): SortFieldContext[] | SortFieldContext | null {
        if (i === undefined) {
            return this.getRuleContexts(SortFieldContext);
        }

        return this.getRuleContext(i, SortFieldContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QMongoParser.COMMA);
    	} else {
    		return this.getToken(QMongoParser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_sortClause;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitSortClause) {
            return visitor.visitSortClause(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SortFieldContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(QMongoParser.IDENTIFIER, 0)!;
    }
    public ASC(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.ASC, 0);
    }
    public DESC(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.DESC, 0);
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_sortField;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitSortField) {
            return visitor.visitSortField(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class PolicyStatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public POLICY(): antlr.TerminalNode {
        return this.getToken(QMongoParser.POLICY, 0)!;
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(QMongoParser.IDENTIFIER, 0)!;
    }
    public LBRACE(): antlr.TerminalNode {
        return this.getToken(QMongoParser.LBRACE, 0)!;
    }
    public policyBody(): PolicyBodyContext {
        return this.getRuleContext(0, PolicyBodyContext)!;
    }
    public RBRACE(): antlr.TerminalNode {
        return this.getToken(QMongoParser.RBRACE, 0)!;
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_policyStatement;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitPolicyStatement) {
            return visitor.visitPolicyStatement(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class PolicyBodyContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public policyRule(): PolicyRuleContext[];
    public policyRule(i: number): PolicyRuleContext | null;
    public policyRule(i?: number): PolicyRuleContext[] | PolicyRuleContext | null {
        if (i === undefined) {
            return this.getRuleContexts(PolicyRuleContext);
        }

        return this.getRuleContext(i, PolicyRuleContext);
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_policyBody;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitPolicyBody) {
            return visitor.visitPolicyBody(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class PolicyRuleContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public MAX_LIMIT(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.MAX_LIMIT, 0);
    }
    public NUMBER(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.NUMBER, 0);
    }
    public ALLOW(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.ALLOW, 0);
    }
    public FIELDS(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.FIELDS, 0);
    }
    public fieldList(): FieldListContext | null {
        return this.getRuleContext(0, FieldListContext);
    }
    public DENY(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.DENY, 0);
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_policyRule;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitPolicyRule) {
            return visitor.visitPolicyRule(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public orExpression(): OrExpressionContext {
        return this.getRuleContext(0, OrExpressionContext)!;
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_expression;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitExpression) {
            return visitor.visitExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class OrExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public andExpression(): AndExpressionContext[];
    public andExpression(i: number): AndExpressionContext | null;
    public andExpression(i?: number): AndExpressionContext[] | AndExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(AndExpressionContext);
        }

        return this.getRuleContext(i, AndExpressionContext);
    }
    public OR(): antlr.TerminalNode[];
    public OR(i: number): antlr.TerminalNode | null;
    public OR(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QMongoParser.OR);
    	} else {
    		return this.getToken(QMongoParser.OR, i);
    	}
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_orExpression;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitOrExpression) {
            return visitor.visitOrExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class AndExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public notExpression(): NotExpressionContext[];
    public notExpression(i: number): NotExpressionContext | null;
    public notExpression(i?: number): NotExpressionContext[] | NotExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(NotExpressionContext);
        }

        return this.getRuleContext(i, NotExpressionContext);
    }
    public AND(): antlr.TerminalNode[];
    public AND(i: number): antlr.TerminalNode | null;
    public AND(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QMongoParser.AND);
    	} else {
    		return this.getToken(QMongoParser.AND, i);
    	}
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_andExpression;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitAndExpression) {
            return visitor.visitAndExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class NotExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public NOT(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.NOT, 0);
    }
    public notExpression(): NotExpressionContext | null {
        return this.getRuleContext(0, NotExpressionContext);
    }
    public primaryExpression(): PrimaryExpressionContext | null {
        return this.getRuleContext(0, PrimaryExpressionContext);
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_notExpression;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitNotExpression) {
            return visitor.visitNotExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class PrimaryExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LPAREN(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.LPAREN, 0);
    }
    public expression(): ExpressionContext | null {
        return this.getRuleContext(0, ExpressionContext);
    }
    public RPAREN(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.RPAREN, 0);
    }
    public comparison(): ComparisonContext | null {
        return this.getRuleContext(0, ComparisonContext);
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_primaryExpression;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitPrimaryExpression) {
            return visitor.visitPrimaryExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ComparisonContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_comparison;
    }
    public override copyFrom(ctx: ComparisonContext): void {
        super.copyFrom(ctx);
    }
}
export class BetweenExprContext extends ComparisonContext {
    public constructor(ctx: ComparisonContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(QMongoParser.IDENTIFIER, 0)!;
    }
    public BETWEEN(): antlr.TerminalNode {
        return this.getToken(QMongoParser.BETWEEN, 0)!;
    }
    public literal(): LiteralContext[];
    public literal(i: number): LiteralContext | null;
    public literal(i?: number): LiteralContext[] | LiteralContext | null {
        if (i === undefined) {
            return this.getRuleContexts(LiteralContext);
        }

        return this.getRuleContext(i, LiteralContext);
    }
    public AND(): antlr.TerminalNode {
        return this.getToken(QMongoParser.AND, 0)!;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitBetweenExpr) {
            return visitor.visitBetweenExpr(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class EndsWithExprContext extends ComparisonContext {
    public constructor(ctx: ComparisonContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(QMongoParser.IDENTIFIER, 0)!;
    }
    public ENDS_WITH(): antlr.TerminalNode {
        return this.getToken(QMongoParser.ENDS_WITH, 0)!;
    }
    public stringLiteral(): StringLiteralContext {
        return this.getRuleContext(0, StringLiteralContext)!;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitEndsWithExpr) {
            return visitor.visitEndsWithExpr(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class ContainsExprContext extends ComparisonContext {
    public constructor(ctx: ComparisonContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(QMongoParser.IDENTIFIER, 0)!;
    }
    public CONTAINS(): antlr.TerminalNode {
        return this.getToken(QMongoParser.CONTAINS, 0)!;
    }
    public stringLiteral(): StringLiteralContext {
        return this.getRuleContext(0, StringLiteralContext)!;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitContainsExpr) {
            return visitor.visitContainsExpr(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class ExprCompareContext extends ComparisonContext {
    public constructor(ctx: ComparisonContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public valueExpr(): ValueExprContext[];
    public valueExpr(i: number): ValueExprContext | null;
    public valueExpr(i?: number): ValueExprContext[] | ValueExprContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ValueExprContext);
        }

        return this.getRuleContext(i, ValueExprContext);
    }
    public comparisonOp(): ComparisonOpContext {
        return this.getRuleContext(0, ComparisonOpContext)!;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitExprCompare) {
            return visitor.visitExprCompare(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class StartsWithExprContext extends ComparisonContext {
    public constructor(ctx: ComparisonContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(QMongoParser.IDENTIFIER, 0)!;
    }
    public STARTS_WITH(): antlr.TerminalNode {
        return this.getToken(QMongoParser.STARTS_WITH, 0)!;
    }
    public stringLiteral(): StringLiteralContext {
        return this.getRuleContext(0, StringLiteralContext)!;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitStartsWithExpr) {
            return visitor.visitStartsWithExpr(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class CompareOpContext extends ComparisonContext {
    public constructor(ctx: ComparisonContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(QMongoParser.IDENTIFIER, 0)!;
    }
    public comparisonOp(): ComparisonOpContext {
        return this.getRuleContext(0, ComparisonOpContext)!;
    }
    public literal(): LiteralContext {
        return this.getRuleContext(0, LiteralContext)!;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitCompareOp) {
            return visitor.visitCompareOp(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class InExprContext extends ComparisonContext {
    public constructor(ctx: ComparisonContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(QMongoParser.IDENTIFIER, 0)!;
    }
    public IN(): antlr.TerminalNode {
        return this.getToken(QMongoParser.IN, 0)!;
    }
    public array(): ArrayContext {
        return this.getRuleContext(0, ArrayContext)!;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitInExpr) {
            return visitor.visitInExpr(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class InVarExprContext extends ComparisonContext {
    public constructor(ctx: ComparisonContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public IDENTIFIER(): antlr.TerminalNode[];
    public IDENTIFIER(i: number): antlr.TerminalNode | null;
    public IDENTIFIER(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QMongoParser.IDENTIFIER);
    	} else {
    		return this.getToken(QMongoParser.IDENTIFIER, i);
    	}
    }
    public IN(): antlr.TerminalNode {
        return this.getToken(QMongoParser.IN, 0)!;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitInVarExpr) {
            return visitor.visitInVarExpr(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class NotInExprContext extends ComparisonContext {
    public constructor(ctx: ComparisonContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(QMongoParser.IDENTIFIER, 0)!;
    }
    public NOT(): antlr.TerminalNode {
        return this.getToken(QMongoParser.NOT, 0)!;
    }
    public IN(): antlr.TerminalNode {
        return this.getToken(QMongoParser.IN, 0)!;
    }
    public array(): ArrayContext {
        return this.getRuleContext(0, ArrayContext)!;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitNotInExpr) {
            return visitor.visitNotInExpr(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class CompareFieldContext extends ComparisonContext {
    public constructor(ctx: ComparisonContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public IDENTIFIER(): antlr.TerminalNode[];
    public IDENTIFIER(i: number): antlr.TerminalNode | null;
    public IDENTIFIER(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QMongoParser.IDENTIFIER);
    	} else {
    		return this.getToken(QMongoParser.IDENTIFIER, i);
    	}
    }
    public comparisonOp(): ComparisonOpContext {
        return this.getRuleContext(0, ComparisonOpContext)!;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitCompareField) {
            return visitor.visitCompareField(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class NotInVarExprContext extends ComparisonContext {
    public constructor(ctx: ComparisonContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public IDENTIFIER(): antlr.TerminalNode[];
    public IDENTIFIER(i: number): antlr.TerminalNode | null;
    public IDENTIFIER(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QMongoParser.IDENTIFIER);
    	} else {
    		return this.getToken(QMongoParser.IDENTIFIER, i);
    	}
    }
    public NOT(): antlr.TerminalNode {
        return this.getToken(QMongoParser.NOT, 0)!;
    }
    public IN(): antlr.TerminalNode {
        return this.getToken(QMongoParser.IN, 0)!;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitNotInVarExpr) {
            return visitor.visitNotInVarExpr(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ComparisonOpContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public EQ(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.EQ, 0);
    }
    public NEQ(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.NEQ, 0);
    }
    public GT(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.GT, 0);
    }
    public LT(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.LT, 0);
    }
    public GTE(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.GTE, 0);
    }
    public LTE(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.LTE, 0);
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_comparisonOp;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitComparisonOp) {
            return visitor.visitComparisonOp(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ValueExprContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_valueExpr;
    }
    public override copyFrom(ctx: ValueExprContext): void {
        super.copyFrom(ctx);
    }
}
export class StringExprContext extends ValueExprContext {
    public constructor(ctx: ValueExprContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public STRING(): antlr.TerminalNode {
        return this.getToken(QMongoParser.STRING, 0)!;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitStringExpr) {
            return visitor.visitStringExpr(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class NumericExprContext extends ValueExprContext {
    public constructor(ctx: ValueExprContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public NUMBER(): antlr.TerminalNode {
        return this.getToken(QMongoParser.NUMBER, 0)!;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitNumericExpr) {
            return visitor.visitNumericExpr(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class MulDivExprContext extends ValueExprContext {
    public constructor(ctx: ValueExprContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public valueExpr(): ValueExprContext[];
    public valueExpr(i: number): ValueExprContext | null;
    public valueExpr(i?: number): ValueExprContext[] | ValueExprContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ValueExprContext);
        }

        return this.getRuleContext(i, ValueExprContext);
    }
    public STAR(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.STAR, 0);
    }
    public SLASH(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.SLASH, 0);
    }
    public MODULO(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.MODULO, 0);
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitMulDivExpr) {
            return visitor.visitMulDivExpr(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class FieldRefExprContext extends ValueExprContext {
    public constructor(ctx: ValueExprContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public FIELD_REF(): antlr.TerminalNode {
        return this.getToken(QMongoParser.FIELD_REF, 0)!;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitFieldRefExpr) {
            return visitor.visitFieldRefExpr(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class FuncExprContext extends ValueExprContext {
    public constructor(ctx: ValueExprContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public exprFunc(): ExprFuncContext {
        return this.getRuleContext(0, ExprFuncContext)!;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitFuncExpr) {
            return visitor.visitFuncExpr(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class ParenValExprContext extends ValueExprContext {
    public constructor(ctx: ValueExprContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public LPAREN(): antlr.TerminalNode {
        return this.getToken(QMongoParser.LPAREN, 0)!;
    }
    public valueExpr(): ValueExprContext {
        return this.getRuleContext(0, ValueExprContext)!;
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(QMongoParser.RPAREN, 0)!;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitParenValExpr) {
            return visitor.visitParenValExpr(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class AddSubExprContext extends ValueExprContext {
    public constructor(ctx: ValueExprContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public valueExpr(): ValueExprContext[];
    public valueExpr(i: number): ValueExprContext | null;
    public valueExpr(i?: number): ValueExprContext[] | ValueExprContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ValueExprContext);
        }

        return this.getRuleContext(i, ValueExprContext);
    }
    public PLUS(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.PLUS, 0);
    }
    public MINUS_OP(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.MINUS_OP, 0);
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitAddSubExpr) {
            return visitor.visitAddSubExpr(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class BooleanExprContext extends ValueExprContext {
    public constructor(ctx: ValueExprContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public BOOLEAN(): antlr.TerminalNode {
        return this.getToken(QMongoParser.BOOLEAN, 0)!;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitBooleanExpr) {
            return visitor.visitBooleanExpr(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class UnaryMinusExprContext extends ValueExprContext {
    public constructor(ctx: ValueExprContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public MINUS_OP(): antlr.TerminalNode {
        return this.getToken(QMongoParser.MINUS_OP, 0)!;
    }
    public valueExpr(): ValueExprContext {
        return this.getRuleContext(0, ValueExprContext)!;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitUnaryMinusExpr) {
            return visitor.visitUnaryMinusExpr(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ExprFuncContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LPAREN(): antlr.TerminalNode {
        return this.getToken(QMongoParser.LPAREN, 0)!;
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(QMongoParser.RPAREN, 0)!;
    }
    public IDENTIFIER(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.IDENTIFIER, 0);
    }
    public NOW(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.NOW, 0);
    }
    public valueExpr(): ValueExprContext[];
    public valueExpr(i: number): ValueExprContext | null;
    public valueExpr(i?: number): ValueExprContext[] | ValueExprContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ValueExprContext);
        }

        return this.getRuleContext(i, ValueExprContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QMongoParser.COMMA);
    	} else {
    		return this.getToken(QMongoParser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_exprFunc;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitExprFunc) {
            return visitor.visitExprFunc(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class LiteralContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public NUMBER(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.NUMBER, 0);
    }
    public MINUS_OP(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.MINUS_OP, 0);
    }
    public STRING(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.STRING, 0);
    }
    public BOOLEAN(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.BOOLEAN, 0);
    }
    public array(): ArrayContext | null {
        return this.getRuleContext(0, ArrayContext);
    }
    public functionCall(): FunctionCallContext | null {
        return this.getRuleContext(0, FunctionCallContext);
    }
    public IDENTIFIER(): antlr.TerminalNode | null {
        return this.getToken(QMongoParser.IDENTIFIER, 0);
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_literal;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitLiteral) {
            return visitor.visitLiteral(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class StringLiteralContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public STRING(): antlr.TerminalNode {
        return this.getToken(QMongoParser.STRING, 0)!;
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_stringLiteral;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitStringLiteral) {
            return visitor.visitStringLiteral(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ArrayContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LBRACKET(): antlr.TerminalNode {
        return this.getToken(QMongoParser.LBRACKET, 0)!;
    }
    public RBRACKET(): antlr.TerminalNode {
        return this.getToken(QMongoParser.RBRACKET, 0)!;
    }
    public literal(): LiteralContext[];
    public literal(i: number): LiteralContext | null;
    public literal(i?: number): LiteralContext[] | LiteralContext | null {
        if (i === undefined) {
            return this.getRuleContexts(LiteralContext);
        }

        return this.getRuleContext(i, LiteralContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(QMongoParser.COMMA);
    	} else {
    		return this.getToken(QMongoParser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_array;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitArray) {
            return visitor.visitArray(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class FunctionCallContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public NOW(): antlr.TerminalNode {
        return this.getToken(QMongoParser.NOW, 0)!;
    }
    public LPAREN(): antlr.TerminalNode {
        return this.getToken(QMongoParser.LPAREN, 0)!;
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(QMongoParser.RPAREN, 0)!;
    }
    public override get ruleIndex(): number {
        return QMongoParser.RULE_functionCall;
    }
    public override accept<Result>(visitor: QMongoVisitor<Result>): Result | null {
        if (visitor.visitFunctionCall) {
            return visitor.visitFunctionCall(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
