# Flutter stack pack

**Checks:** `["dart analyze", "flutter test"]`

## Conventions
- A clear state approach (Riverpod, Bloc or provider) chosen once and kept.
- Widgets small and composable; logic out of build methods.
- Handle offline and error states in the UI for every async call.

## Pitfalls
- Test on both platforms; Material and Cupertino differ.
- Don't block the UI thread with heavy work; use isolates.
- Keep secrets out of the bundle.

## Testing
- `flutter test` for units and widgets, integration_test for end-to-end.
