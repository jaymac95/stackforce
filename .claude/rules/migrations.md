---
description: Standards for database migrations
paths: ["**/migrations/**", "**/*migration*"]
---
- Every migration is reversible, or carries a written reason why not.
- Never edit a migration that has already been applied; add a new one.
- Add indexes for foreign keys and frequently filtered columns.
- No destructive change to shared data without explicit user approval.
