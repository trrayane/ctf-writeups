/**
 * QMongo Errors
 */

export class QMongoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QMongoError";
  }
}

export class QMongoParseError extends QMongoError {
  public readonly line: number;
  public readonly column: number;
  public readonly offendingSymbol?: string;

  constructor(
    message: string,
    line: number,
    column: number,
    offendingSymbol?: string,
  ) {
    super(`Parse error at ${line}:${column}: ${message}`);
    this.name = "QMongoParseError";
    this.line = line;
    this.column = column;
    this.offendingSymbol = offendingSymbol;
  }
}

export class QMongoCompileError extends QMongoError {
  constructor(message: string) {
    super(message);
    this.name = "QMongoCompileError";
  }
}

export class QMongoExecutionError extends QMongoError {
  constructor(message: string) {
    super(message);
    this.name = "QMongoExecutionError";
  }
}
