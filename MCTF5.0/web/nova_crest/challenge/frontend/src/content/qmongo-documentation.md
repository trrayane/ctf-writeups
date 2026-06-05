# QMongo Documentation

QMongo is a declarative query language built by NovaCrest Biosciences for MongoDB applications. It provides a compact, SQL-like syntax for querying, inserting, updating, deleting, and aggregating documents.

This document matches the current QMongo implementation in this repository.

## Why NovaCrest Built QMongo

NovaCrest built QMongo to solve a practical internal problem inside Meridian, the company's clinical data platform.

Clinical trial data is highly structured and relational. Trials reference researchers, cohorts, patient records, adverse events, compounds, and outcome data. The people who need to query that information most often are usually not engineers:

- clinical data analysts
- regulatory affairs specialists
- biostatisticians
- medical officers reviewing outcomes

Those teams understand the data deeply, but they should not need to write raw MongoDB queries or application code just to answer operational questions. Before QMongo, query requests had to be routed through the engineering team, which created reporting delays and slowed down decision-making across NovaCrest's active therapy programs.

Marcus Williams' platform engineering team had already built Meridian to centralize clinical data. MongoDB was selected early because trial schemas evolve constantly across study phases.
QMongo was NovaCrest's answer to that gap. Internally, it was designed around three goals:

- read like English instead of application code
- embed cleanly inside Meridian's admin query builder UI

The internal pitch was simple:

> Give your clinical team SQL-like power over MongoDB without touching the codebase.

That tradeoff made QMongo practical for NovaCrest's operating model. A bioinformatician or analyst who already works in R or Python can learn the syntax quickly, then use Meridian to pull cohort outcome data, cross-reference researcher records, and filter by trial status without filing an engineering ticket first.

## Quick Start

Write a query in QMongo syntax:

```qmongo
from User
where status == "active" and userType in ["staff", "admin"]
select fullName, email, title
order by createdAt desc
limit 10
```

How to use it:

1. Open the admin QMongo console.
2. Paste or write your QMongo query.
3. Run the query.
4. Review records in the graph/result view.
5. Refine filters (`where`), projection (`select`), and pagination (`limit`/`offset`) as needed.

## Language Overview

QMongo programs contain zero or more statements:

- `let`
- `from`
- `insert into`
- `update`
- `delete from`
- `aggregate`
- `policy`

Keywords are case-insensitive, so `FROM`, `from`, and `From` are equivalent.

## Variables

Variables are declared with `let` and are resolved during compilation.

```qmongo
let activeStatus = "active"
let visibleStatuses = ["published", "draft"]
let highlightOnly = true
```

Supported literal values:

- numbers
- strings
- booleans
- arrays
- `now()`

Variables can be used anywhere the grammar accepts a literal or numeric variable reference:

```qmongo
let pageSize = 20
let pageOffset = 40

from Article
where status in visibleStatuses and visibility == "public"
limit pageSize
offset pageOffset
```

## Querying With `from`

The `from` statement reads documents from a model.

General form:

```qmongo
from <ModelName>
where <expression>
select <field>, <field>
include <relation> { ... }
order by <field> asc|desc
limit <number-or-variable>
offset <number-or-variable>
```

Every clause after the model name is optional.

Examples:

```qmongo
from User
```

```qmongo
from User
where status == "active" and userType == "staff"
select fullName, email
order by createdAt desc
limit 25
offset 50
```

## Filtering With `where`

`where` supports:

- comparison operators: `==`, `!=`, `>`, `<`, `>=`, `<=`
- logical operators: `and`, `or`, `not`
- membership: `in`, `not in`
- ranges: `between`
- string matching: `contains`, `startsWith`, `endsWith`
- expression comparisons using field references, arithmetic, and functions

Examples:

```qmongo
from User
where status == "active" and mustSetPassword == false
```

```qmongo
from User
where userType in ["admin", "staff"]
```

```qmongo
from User
where not mustSetPassword == true
```

```qmongo
from TeamProfile
where displayOrder between 1 and 12
```

```qmongo
from Article
where title contains "pipeline"
```

Parentheses are supported:

```qmongo
from User
where (status == "active" and userType == "staff") or userType == "admin"
```

## Selecting Fields

Use `select` to build a projection:

```qmongo
from User
select fullName, email, userType
```

This compiles to a projection similar to:

```json
{ "fullName": 1, "email": 1, "userType": 1 }
```

## Sorting and Pagination

Sorting:

```qmongo
from User
order by createdAt desc
```

Multiple sort fields:

```qmongo
from JobPosting
order by status asc, publishedAt desc, title asc
```

Pagination:

```qmongo
from User
limit 20
offset 40
```

`limit` and `offset` accept either number literals or variables bound to numbers.

## Relations With `include`

Basic include:

```qmongo
from Article
include authorId
```

```qmongo
from TeamProfile
include authorId {
  where status == "active"
  select fullName, email, title
  order by createdAt desc
  limit 5
}
```

```qmongo
from TeamProfile
include authorId {
  include roleId {
      select code, name
    }
  }
}
```

Supported clauses inside an `include { ... }` block:

- `where`
- `select`
- `order by`
- `limit`
- nested `include`

## Insert

`insert into` creates one document.

```qmongo
insert into ContactInquiry {
  source: "contact",
  fullName: "Dana Cole",
  email: "dana.cole@example.com",
  subject: "Partnership request",
  message: "Need trial collaboration details."
}
```

Using variables and `now()`:

```qmongo
let authorId = "abc123"

insert into Article {
  slug: "phase-2-overview",
  category: "research",
  visibility: "public",
  status: "published",
  title: "Phase 2 Overview",
  body: "Interim efficacy and safety findings.",
  authorId: authorId,
  publishedAt: now()
}
```

## Update

`update` requires a `where` clause and a `set` block.

```qmongo
update User
where status == "pending_verification"
set {
  status = "active"
}
```

Multiple assignments are allowed:

```qmongo
update JobApplication
where status == "submitted"
set {
  status = "in_review",
  adminNotes = "Assigned to recruitment coordinator",
  updatedAt = now()
}
```

## Delete

`delete from` removes documents matching a filter.

```qmongo
delete from Session
where revokedAt != null
```

## Aggregate

`aggregate` builds a MongoDB aggregation pipeline.

Example:

```qmongo
aggregate JobApplication {
  match status in ["submitted", "in_review", "accepted", "rejected"]
  group by status {
    totalApplications = count()
  }
  sort totalApplications desc
  limit 10
}
```

Supported aggregate clauses, in order:

- `match`
- `lookup`
- `group by`
- `having`
- `sort`
- `limit`

### Lookup

```qmongo
aggregate JobApplication {
  lookup JobPosting on JobApplication.jobPostingId == JobPosting._id
}
```

### Group Functions

The following functions are supported inside `group by`:

- `count()`
- `sum(field)`
- `avg(field)`
- `min(field)`
- `max(field)`

Example:

```qmongo
aggregate TeamProfile {
  group by status {
    total = count(),
    totalDisplayOrder = sum(displayOrder),
    avgDisplayOrder = avg(displayOrder),
    lowestDisplayOrder = min(displayOrder),
    highestDisplayOrder = max(displayOrder)
  }
}
```

## Policies

Policies are collected during compilation and applied to `from` statements for the target model.

```qmongo
policy User {
  maxLimit 100
  allow fields fullName, email, userType, status, title
  deny fields passwordHash, verifyEmailTokenHash, resetPasswordTokenHash
}
```

Supported rules:

- `maxLimit <number>`
- `allow fields <field>, <field>, ...`
- `deny fields <field>, <field>, ...`

Behavior:

- `maxLimit` caps a query limit and also supplies a default limit when none is present
- `allow fields` trims an existing projection to the listed fields
- `deny fields` removes fields from the projection

## Comments

Line comments use `--`:

```qmongo
-- fetch published public articles
from Article
where status == "published" and visibility == "public"
```

## Expressions

### Standard Comparisons

```qmongo
from User where status == "active"
from User where status != "disabled"
from TeamProfile where displayOrder > 10
```

### Membership and Range

```qmongo
from User where userType in ["admin", "staff"]
from User where userType not in ["portal"]
from TeamProfile where displayOrder between 1 and 30
```

### String Matching

```qmongo
from Article where title contains "phase"
from User where email endsWith "@novacrestbio.com"
from JobPosting where location startsWith "Remote"
```

String operators compile to case-insensitive regular expressions.

### Field References and Expression Comparisons

Field references use a leading `$` and support dot paths:

```qmongo
from JobPosting where $publishedAt > $createdAt
from User where $lastLoginAt > $emailVerifiedAt
```

Expression comparisons compile through MongoDB `$expr`.

### Arithmetic Expressions

Supported arithmetic operators:

- `+`
- `-`
- `*`
- `/`
- `%`
- unary `-`

Examples:

```qmongo
from TeamProfile where $displayOrder * 10 >= 100
from TeamProfile where $displayOrder + 5 > 12
from TeamProfile where $displayOrder > -1
from TeamProfile where $displayOrder % 2 == 0
```

Operator precedence follows normal arithmetic rules. Parentheses are supported.

## Expression Functions

Function names are normalized to lowercase during compilation.

### Array Functions

- `size(value)`
- `arrayElemAt(array, index)`
- `first(value)`
- `last(value)`
- `indexOfArray(array, value)`
- `isArray(value)`
- `reverseArray(value)`
- `slice(array, n)`
- `slice(array, start, length)`

### Math Functions

- `abs(value)`
- `ceil(value)`
- `floor(value)`
- `round(value)`
- `round(value, places)`
- `mod(left, right)`
- `pow(base, exponent)`
- `sqrt(value)`
- `log(value)`
- `log10(value)`

`log(value)` compiles to MongoDB `$ln`.

### Date Functions

- `year(value)`
- `month(value)`
- `dayOfMonth(value)`
- `hour(value)`
- `minute(value)`
- `second(value)`
- `dayOfWeek(value)`
- `dayOfYear(value)`
- `week(value)`
- `now()`

### String Functions

- `toLower(value)`
- `toUpper(value)`
- `strlen(value)`
- `substr(value, start, length)`
- `concat(value, value, ...)`
- `trim(value)`
- `indexof(value, substring)`

### Conditional Functions

- `ifNull(value, fallback)`
- `cond(test, thenValue, elseValue)`

### Type Functions

- `type(value)`
- `toString(value)`
- `toInt(value)`
- `toDouble(value)`
- `toBool(value)`
- `toDate(value)`
- `toObjectId(value)`

### Comparison Function

- `cmp(left, right)`

Examples:

```qmongo
from Article where size($tags) > 3
from User where toLower($email) == "admin@example.com"
from AuditLog where year($createdAt) == 2026
from User where ifNull($phoneNumber, "") != ""
from TeamProfile where abs(floor($displayOrder)) > 3
from Session where $expiresAt > now()
```

## Literal Types

Supported literals:

- numbers: `42`, `-3`, `99.5`
- strings: `"hello"`
- booleans: `true`, `false`
- arrays: `["a", "b"]`

Strings are double-quoted.

## Usage Flow

QMongo usage in practice follows this sequence:

1. Write a valid QMongo statement or script.
2. Validate syntax and model/field references.
3. Execute the query in the QMongo console.
4. Inspect returned records and graph relationships.
5. Iterate on filters, sort, projection, and limits.

Typical read query:

```qmongo
from Article
where status == "published" and visibility == "public"
select slug, title, category, publishedAt
order by publishedAt desc
limit 10
```

Typical update query:

```qmongo
update User
where status == "pending_verification"
set {
  status = "active",
  emailVerifiedAt = now()
}
```

Typical aggregation query:

```qmongo
aggregate JobApplication {
  match status in ["submitted", "in_review", "accepted", "rejected"]
  group by status {
    total = count()
  }
  sort total desc
  limit 5
}
```

## Result Shapes

QMongo statements return data in these practical categories:

- `from`: document list (with optional includes/populated relations)
- `insert into`: inserted document
- `update`: matched/modified document set
- `delete from`: removed document set
- `aggregate`: aggregation rows per pipeline stages

## Error Handling

Example invalid query:

```qmongo
from User
where status === "active"
```

In this case, `===` is invalid in QMongo and should be replaced with `==`.

Compilation and execution failures may also surface as standard `Error` instances, such as:

- undefined variable references
- invalid numeric variable usage in `limit` or `offset`
- unknown model names during execution

## Complete Example

```qmongo
let activeStatus = "active"
let staffAndAdmin = ["staff", "admin"]

from User
where status == activeStatus and userType in staffAndAdmin
select fullName, email, userType, title
include roleId {
  select code, name
}
order by createdAt desc
limit 20
offset 40

from Article
where status == "published" and visibility == "public"
select slug, title, category, publishedAt
include authorId {
  select fullName, email
}
order by publishedAt desc
limit 10

from TeamProfile
where status == "published"
include linkedUserId {
  select fullName, email
}
order by displayOrder asc
limit 5

update User
where status == "pending_verification"
set {
  status = "active",
  emailVerifiedAt = now()
}

insert into ContactInquiry {
  source: "contact",
  fullName: "Avery Morgan",
  email: "avery.morgan@example.com",
  company: "North Valley Labs",
  subject: "Clinical partnership",
  message: "Please share current oncology pipeline details."
}

delete from Session
where revokedAt != null

aggregate JobApplication {
  match status in ["submitted", "in_review", "accepted", "rejected"]
  group by status {
    total = count()
  }
  sort total desc
  limit 5
}
```
