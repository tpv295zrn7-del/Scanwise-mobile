import { SavedItemsScreen } from './SavedItemsScreen';
import { ProductResultScreen } from './ProductResultScreen';

test('saved empty state and confidence badges', () => {
  expect(SavedItemsScreen().empty).toBe(true);
  expect(SavedItemsScreen({ items: [] }).empty).toBe(true);
  expect(ProductResultScreen({ confidence: 'estimated' }).badge.props.bg).toBe(
    '#FEF3C7'
  );
  expect(SavedItemsScreen({ items: [{ id: 1 }] }).empty).toBe(false);
  expect(ProductResultScreen({}).badge.props.text).toBe('#065F46');
});
