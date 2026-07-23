# Testing Guide

## Test structure
- `src/__tests__/redux` for slice tests
- `src/__tests__/screens` for screen tests
- `src/__tests__/integration` for flow tests
- `src/__tests__/services` and `src/__tests__/components` for utility coverage

## Run tests
```bash
npm test
npm run test:watch
```

## Coverage
Coverage is collected for all files under `src` except type declaration and barrel-only files. Minimum global threshold is 90%.

## Debugging
Use `npm test -- --runInBand` to simplify debugging of async failures.

## Adding tests
Follow existing patterns: render the component, exercise user interaction, and assert state/UI changes.
