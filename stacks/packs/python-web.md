# Django / FastAPI stack pack

**Checks (Django):** `["ruff check .", "python manage.py test"]`
**Checks (FastAPI):** `["ruff check .", "pytest"]`

## Conventions
- Django: fat models / thin views, or services for complex logic. Use the ORM and migrations.
- FastAPI: Pydantic models for every request and response. Dependency injection for auth and DB sessions.
- Type-hint everything; run mypy or pyright if configured.

## Pitfalls
- Django: don't skip migrations; never edit applied ones.
- FastAPI: validate and serialize through Pydantic, don't return raw ORM objects.
- Handle DB sessions per request; don't share across requests.

## Testing
- pytest. Use a test database, factories for data.
