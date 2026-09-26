# Laravel stack pack

**Checks:** `["./vendor/bin/pint --test", "php artisan test"]`

## Conventions
- Follow Laravel's structure: controllers thin, logic in actions or services.
- Validation via Form Requests. Authorization via Policies and Gates.
- Eloquent for data; migrations for every schema change, with a `down()`.

## Pitfalls
- Guard against N+1 queries; eager-load relations.
- Never trust request input for authorization — check policies server-side.
- Keep secrets in `.env`; document names in `.env.example`.

## Testing
- Pest or PHPUnit. Feature tests for endpoints, unit tests for services.
