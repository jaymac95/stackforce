# React Native / Expo stack pack

**Checks:** `["npm run lint", "npm run typecheck", "npm test -- --run"]`

## Conventions
- Expo Router for navigation. Keep screens thin; hooks for logic.
- Test behaviours on both iOS and Android, not one simulator.
- Use EAS for builds and submissions.

## Pitfalls
- Handle offline and slow networks explicitly; assume requests fail.
- Respect safe areas and platform navigation conventions.
- Keep secrets out of the app bundle — anything shipped is readable.

## Testing
- Jest + React Native Testing Library. Maestro or Detox for end-to-end if needed.
