import { ProductResultScreen } from './ProductResultScreen';
import { mockScanResponses } from '../services/mockScanResponses';

describe('ProductResultScreen', () => {
  test('renders product details', () => {
    const screen = ProductResultScreen({
      scanResult: mockScanResponses.verified
    });

    expect(screen.productName).toBe('Protein Bar');
    expect(screen.brand).toBe('ScanWise');
    expect(screen.barcode).toBe('0123456789012');
  });

  test('renders confidence badge from scan result', () => {
    const screen = ProductResultScreen({
      scanResult: mockScanResponses.estimated
    });

    expect(screen.confidence).toBe('estimated');
    expect(screen.badge.props.bg).toBe('#FEF3C7');
  });

  test('renders Save, Compare, and Correct buttons', () => {
    const screen = ProductResultScreen({
      scanResult: mockScanResponses.incomplete
    });

    expect(screen.saveButton.props.title).toBe('Save');
    expect(screen.compareButton.props.title).toBe('Compare');
    expect(screen.correctButton.props.title).toBe('Correct');
    expect(screen.correctIcon).toBeTruthy();
  });

  test('supports product prop and default placeholders', () => {
    const fromProduct = ProductResultScreen({
      product: mockScanResponses.verified
    });
    const empty = ProductResultScreen();

    expect(fromProduct.productName).toBe('Protein Bar');
    expect(empty.productName).toBe('Unknown Product');
    expect(empty.nutritionInfo).toBe('Nutrition information coming soon.');
  });
});
