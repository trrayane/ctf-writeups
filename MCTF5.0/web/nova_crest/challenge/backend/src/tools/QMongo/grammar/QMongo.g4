// Combined grammar for QMongo
grammar QMongo;

// ─── Parser Rules ────────────────────────────────────────────

program
    : statement* EOF
    ;

statement
    : letStatement
    | fromStatement
    | insertStatement
    | updateStatement
    | deleteStatement
    | aggregateStatement
    | policyStatement
    ;

// ─── LET ─────────────────────────────────────────────────────

letStatement
    : LET IDENTIFIER ASSIGN literal
    ;

// ─── FROM (SELECT/FIND) ─────────────────────────────────────

fromStatement
    : FROM IDENTIFIER
      whereClause?
      selectClause?
      includeClause*
      orderByClause?
      limitClause?
      offsetClause?
    ;

whereClause
    : WHERE expression
    ;

selectClause
    : SELECT fieldList
    ;

fieldList
    : IDENTIFIER (COMMA IDENTIFIER)*
    ;

includeClause
    : INCLUDE IDENTIFIER (LBRACE includeBody RBRACE)?
    ;

includeBody
    : whereClause?
      selectClause?
      orderByClause?
      limitClause?
      includeClause*
    ;

orderByClause
    : ORDER BY orderField (COMMA orderField)*
    ;

orderField
    : IDENTIFIER (ASC | DESC)?
    ;

limitClause
    : LIMIT (NUMBER | IDENTIFIER)
    ;

offsetClause
    : OFFSET (NUMBER | IDENTIFIER)
    ;

// ─── INSERT ──────────────────────────────────────────────────

insertStatement
    : INSERT INTO IDENTIFIER LBRACE insertFieldList RBRACE
    ;

insertFieldList
    : insertField (COMMA insertField)*
    ;

insertField
    : IDENTIFIER COLON literal
    ;

// ─── UPDATE ──────────────────────────────────────────────────

updateStatement
    : UPDATE IDENTIFIER whereClause setClause
    ;

setClause
    : SET LBRACE setFieldList RBRACE
    ;

setFieldList
    : setField (COMMA setField)*
    ;

setField
    : IDENTIFIER ASSIGN (literal | functionCall)
    ;

// ─── DELETE ──────────────────────────────────────────────────

deleteStatement
    : DELETE FROM IDENTIFIER whereClause
    ;

// ─── AGGREGATE ───────────────────────────────────────────────

aggregateStatement
    : AGGREGATE IDENTIFIER LBRACE aggregateBody RBRACE
    ;

aggregateBody
    : matchClause?
      lookupClause*
      groupByClause?
      havingClause?
      sortClause?
      limitClause?
    ;

matchClause
    : MATCH expression
    ;

lookupClause
    : LOOKUP IDENTIFIER ON dotPath EQ dotPath
    ;

dotPath
    : IDENTIFIER (DOT IDENTIFIER)*
    ;

groupByClause
    : GROUP BY IDENTIFIER LBRACE groupFieldList RBRACE
    ;

groupFieldList
    : groupField (COMMA groupField)*
    ;

groupField
    : IDENTIFIER ASSIGN aggregateFunction
    ;

aggregateFunction
    : COUNT LPAREN RPAREN
    | SUM LPAREN IDENTIFIER RPAREN
    | AVG LPAREN IDENTIFIER RPAREN
    | MIN_FUNC LPAREN IDENTIFIER RPAREN
    | MAX_FUNC LPAREN IDENTIFIER RPAREN
    ;

havingClause
    : HAVING expression
    ;

sortClause
    : SORT sortField (COMMA sortField)*
    ;

sortField
    : IDENTIFIER (ASC | DESC)?
    ;

// ─── POLICY ─────────────────────────────────────────────────

policyStatement
    : POLICY IDENTIFIER LBRACE policyBody RBRACE
    ;

policyBody
    : policyRule*
    ;

policyRule
    : MAX_LIMIT NUMBER
    | ALLOW FIELDS fieldList
    | DENY FIELDS fieldList
    ;

// ─── EXPRESSIONS ────────────────────────────────────────────

expression
    : orExpression
    ;

orExpression
    : andExpression (OR andExpression)*
    ;

andExpression
    : notExpression (AND notExpression)*
    ;

notExpression
    : NOT notExpression
    | primaryExpression
    ;

primaryExpression
    : LPAREN expression RPAREN
    | comparison
    ;

comparison
    : IDENTIFIER comparisonOp literal              # CompareOp
    | IDENTIFIER comparisonOp IDENTIFIER           # CompareField
    | IDENTIFIER IN array                          # InExpr
    | IDENTIFIER IN IDENTIFIER                     # InVarExpr
    | IDENTIFIER NOT IN array                      # NotInExpr
    | IDENTIFIER NOT IN IDENTIFIER                 # NotInVarExpr
    | IDENTIFIER BETWEEN literal AND literal       # BetweenExpr
    | IDENTIFIER CONTAINS stringLiteral            # ContainsExpr
    | IDENTIFIER STARTS_WITH stringLiteral         # StartsWithExpr
    | IDENTIFIER ENDS_WITH stringLiteral           # EndsWithExpr
    | valueExpr comparisonOp valueExpr             # ExprCompare
    ;

comparisonOp
    : EQ | NEQ | GT | LT | GTE | LTE
    ;

// ─── VALUE EXPRESSIONS ($expr) ──────────────────────────────

valueExpr
    : valueExpr (STAR | SLASH | MODULO) valueExpr  # MulDivExpr
    | valueExpr (PLUS | MINUS_OP) valueExpr        # AddSubExpr
    | MINUS_OP valueExpr                           # UnaryMinusExpr
    | exprFunc                                     # FuncExpr
    | FIELD_REF                                    # FieldRefExpr
    | NUMBER                                       # NumericExpr
    | STRING                                       # StringExpr
    | BOOLEAN                                      # BooleanExpr
    | LPAREN valueExpr RPAREN                      # ParenValExpr
    ;

exprFunc
    : (IDENTIFIER | NOW) LPAREN (valueExpr (COMMA valueExpr)*)? RPAREN
    ;

// ─── LITERALS ───────────────────────────────────────────────

literal
    : MINUS_OP? NUMBER
    | STRING
    | BOOLEAN
    | array
    | functionCall
    | IDENTIFIER   // variable reference
    ;

stringLiteral
    : STRING
    ;

array
    : LBRACKET (literal (COMMA literal)*)? RBRACKET
    ;

functionCall
    : NOW LPAREN RPAREN
    ;

// ─── Lexer Rules ─────────────────────────────────────────────

// Keywords (case-insensitive fragments used internally)
LET         : L E T ;
FROM        : F R O M ;
WHERE       : W H E R E ;
SELECT      : S E L E C T ;
INCLUDE     : I N C L U D E ;
ORDER       : O R D E R ;
BY          : B Y ;
ASC         : A S C ;
DESC        : D E S C ;
LIMIT       : L I M I T ;
OFFSET      : O F F S E T ;
INSERT      : I N S E R T ;
INTO        : I N T O ;
UPDATE      : U P D A T E ;
SET         : S E T ;
DELETE      : D E L E T E ;
AGGREGATE   : A G G R E G A T E ;
MATCH       : M A T C H ;
GROUP       : G R O U P ;
HAVING      : H A V I N G ;
SORT        : S O R T ;
LOOKUP      : L O O K U P ;
ON          : O N ;
POLICY      : P O L I C Y ;
MAX_LIMIT   : M A X L I M I T ;
ALLOW       : A L L O W ;
DENY        : D E N Y ;
FIELDS      : F I E L D S ;
FILTER      : F I L T E R ;

AND         : A N D ;
OR          : O R ;
NOT         : N O T ;
IN          : I N ;
BETWEEN     : B E T W E E N ;
CONTAINS    : C O N T A I N S ;
STARTS_WITH : S T A R T S W I T H ;
ENDS_WITH   : E N D S W I T H ;

NOW         : N O W ;
COUNT       : C O U N T ;
SUM         : S U M ;
AVG         : A V G ;
MIN_FUNC    : M I N ;
MAX_FUNC    : M A X ;

BOOLEAN     : T R U E | F A L S E ;

// Operators
EQ          : '==' ;
NEQ         : '!=' ;
GTE         : '>=' ;
LTE         : '<=' ;
GT          : '>' ;
LT          : '<' ;
ASSIGN      : '=' ;

// Arithmetic operators
PLUS        : '+' ;
MINUS_OP    : '-' ;
STAR        : '*' ;
SLASH       : '/' ;
MODULO      : '%' ;

// Punctuation
LBRACE      : '{' ;
RBRACE      : '}' ;
LBRACKET    : '[' ;
RBRACKET    : ']' ;
LPAREN      : '(' ;
RPAREN      : ')' ;
COMMA       : ',' ;
DOT         : '.' ;
COLON       : ':' ;

// Literals
NUMBER      : [0-9]+ ('.' [0-9]+)? ;
STRING      : '"' (~["\\\r\n] | '\\' .)* '"' ;

// Field references ($field, $field.path)
FIELD_REF   : '$' [a-zA-Z_] [a-zA-Z0-9_.]* ;

// Identifiers (must come after keywords)
IDENTIFIER  : [a-zA-Z_] [a-zA-Z0-9_]* ;

// Skip
WS          : [ \t\r\n]+ -> skip ;
LINE_COMMENT: '--' ~[\r\n]* -> skip ;

// Case-insensitive character fragments
fragment A : [aA]; fragment B : [bB]; fragment C : [cC]; fragment D : [dD];
fragment E : [eE]; fragment F : [fF]; fragment G : [gG]; fragment H : [hH];
fragment I : [iI]; fragment J : [jJ]; fragment K : [kK]; fragment L : [lL];
fragment M : [mM]; fragment N : [nN]; fragment O : [oO]; fragment P : [pP];
fragment Q : [qQ]; fragment R : [rR]; fragment S : [sS]; fragment T : [tT];
fragment U : [uU]; fragment V : [vV]; fragment W : [wW]; fragment X : [xX];
fragment Y : [yY]; fragment Z : [zZ];
