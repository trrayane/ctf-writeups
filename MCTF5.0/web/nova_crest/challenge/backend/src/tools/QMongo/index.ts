/**
 * QMongo — Main Entry Point
 *
 * Public API for parsing, compiling, and executing QMongo programs.
 *
 * Usage:
 *   import { parse, compile, QMongo } from 'qmongo';
 *
 *   const ast = parse(`from User where age >= 18`);
 *   const plans = compile(ast);
 *
 *   // With Mongoose models:
 *   const qm = new QMongo({ models: { User: UserModel } });
 *   const results = await qm.run(`from User where age >= 18`);
 */

import { CharStream, CommonTokenStream } from "antlr4ng";
import { QMongoLexer } from "./generated/QMongoLexer.js";
import { QMongoParser } from "./generated/QMongoParser.js";
import { ASTBuilder } from "./visitor.js";
import { QueryPlanCompiler, type CompilerOptions } from "./compiler.js";
import {
  ExecutionEngine,
  type ExecutionContext,
  type ExecutionResult,
} from "./engine.js";
import { QMongoParseError } from "./errors.js";
import type { QMongoProgram } from "./ast.js";
import type { QueryPlan } from "./queryPlan.js";
import type { Model } from "mongoose";

// Re-export all public types
export * from "./ast.js";
export * from "./queryPlan.js";
export * from "./compiler.js";
export * from "./engine.js";
export * from "./errors.js";
export { ASTBuilder } from "./visitor.js";

// ─── Error Listener ──────────────────────────────────────────

class ThrowingErrorListener {
  syntaxError(
    _recognizer: any,
    offendingSymbol: any,
    line: number,
    charPositionInLine: number,
    msg: string,
    _e: any,
  ): void {
    throw new QMongoParseError(
      msg,
      line,
      charPositionInLine,
      offendingSymbol?.text,
    );
  }
  reportAmbiguity() {
    /* ignored */
  }
  reportAttemptingFullContext() {
    /* ignored */
  }
  reportContextSensitivity() {
    /* ignored */
  }
}

// ─── Parse ───────────────────────────────────────────────────

/**
 * Parse a QMongo source string into an AST.
 */
export function parse(source: string): QMongoProgram {
  const inputStream = CharStream.fromString(source);
  const lexer = new QMongoLexer(inputStream);

  // Replace default error listeners
  lexer.removeErrorListeners();
  lexer.addErrorListener(new ThrowingErrorListener() as any);

  const tokenStream = new CommonTokenStream(lexer);
  const parser = new QMongoParser(tokenStream);

  parser.removeErrorListeners();
  parser.addErrorListener(new ThrowingErrorListener() as any);

  const tree = parser.program();
  const visitor = new ASTBuilder();
  const ast = visitor.visitProgram!(tree);

  return ast;
}

// ─── Compile ─────────────────────────────────────────────────

/**
 * Compile a QMongo AST into a list of executable QueryPlans.
 */
export function compile(
  ast: QMongoProgram,
  options?: CompilerOptions,
): QueryPlan[] {
  const compiler = new QueryPlanCompiler(options);
  return compiler.compileProgram(ast);
}

// ─── QMongo Class (Full Pipeline) ────────────────────────────

export interface QMongoOptions {
  /** Mongoose models keyed by name */
  models: Record<string, Model<any>>;
}

export class QMongo {
  private engine: ExecutionEngine;

  constructor(options: QMongoOptions) {
    this.engine = new ExecutionEngine({ models: options.models });
  }

  /**
   * Parse, compile, and execute a QMongo source string.
   * Returns all results from all statements.
   */
  async run(source: string): Promise<ExecutionResult[]> {
    const ast = parse(source);
    const plans = compile(ast);
    return this.engine.executeAll(plans);
  }

  /**
   * Parse and compile without executing — useful for inspection / dry-run.
   */
  explain(source: string): QueryPlan[] {
    const ast = parse(source);
    return compile(ast);
  }

  /**
   * Execute pre-compiled plans.
   */
  async executePlans(plans: QueryPlan[]): Promise<ExecutionResult[]> {
    return this.engine.executeAll(plans);
  }
}
