# Batch 4 Plan: Barcode Scanning Integration

## Phase 1: Barcode scanning

- Integrate `react-native-vision-camera` for camera access and preview
- Add ML Kit barcode detection flow for scan capture
- Add haptic feedback on successful scan

## Phase 2: Backend API integration

- Connect scan flow to `/api/scans`
- Implement product lookup by barcode
- Handle confidence levels from API responses (verified, estimated, incomplete)

## Phase 3: Product result display

- Display scanned product details and confidence output
- Show alternatives and comparison data from backend
- Add goal-matching presentation for suggested alternatives

## Phase 4: Save/bookmark

- Integrate `icon-save.png` save action in result UI
- Persist saved products with AsyncStorage
- Sync saved items in Redux state

## Phase 5: Corrections

- Integrate `icon-correct.png` correction action
- Add correction submission flow
- Connect correction submission to `/api/corrections`

## Phase 6: Testing

- Add camera mocks for scan flow tests
- Add API mocks for scan, alternatives, and corrections endpoints
- Maintain 90%+ test coverage for Batch 4 additions

## Dependencies to add

- `react-native-vision-camera`
- `react-native-device-info`
- `react-native-haptic-feedback`

## Screens to modify

- `ScanScreen`
- `ProductResultScreen`
- `SavedItemsScreen`
- `CorrectionSubmissionScreen`

## Components to enhance

- `ConfidenceBadge` (display real confidence types)
- `FormButton` (handle save action)

## Services to update

- `api.js` (add `/scans`, `/alternatives`, `/corrections` endpoints)
