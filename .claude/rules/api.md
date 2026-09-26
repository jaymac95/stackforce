---
description: Standards for API endpoints and server logic
paths: ["**/api/**", "**/routes/**", "**/app/api/**", "**/controllers/**"]
---
- Validate every input at the boundary; never trust the client.
- Check authorization on the server for every protected action.
- Return a consistent error shape and appropriate status codes.
- Keep secrets in environment variables; document names in `.env.example`.
- No secrets or personal data in logs.
