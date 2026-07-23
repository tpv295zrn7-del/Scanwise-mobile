import { SavedItemsScreen } from './SavedItemsScreen';

describe('SavedItemsScreen', () => {
  test('renders empty state', () => {
    const screen = SavedItemsScreen();
    expect(screen.empty).toBe(true);
    expect(screen.emptyStateText).toBe('No saved items yet');
  });

  test('renders list and handles remove/rescan', () => {
    const onRemove = jest.fn();
    const onRescan = jest.fn();
    const onLongPressRemove = jest.fn();

    const screen = SavedItemsScreen({
      items: [
        {
          id: '1',
          name: 'Item 1',
          brand: 'Brand',
          lastScannedDate: '2026-07-23',
          confidence: 'verified'
        }
      ],
      onRemove,
      onRescan,
      onLongPressRemove
    });

    expect(screen.empty).toBe(false);
    expect(screen.items[0]).toEqual(
      expect.objectContaining({
        id: '1',
        name: 'Item 1',
        brand: 'Brand',
        confidence: 'verified'
      })
    );

    screen.removeItem('1');
    screen.rescanItem('1');

    expect(onRemove).toHaveBeenCalledWith('1');
    expect(onLongPressRemove).toHaveBeenCalledWith('1');
    expect(onRescan).toHaveBeenCalledWith('1');
  });

  test('uses default item fields and supports no-op callbacks', () => {
    const screen = SavedItemsScreen({
      items: [{ id: '2', name: 'Item 2', brand: 'Brand 2' }]
    });

    expect(screen.items[0]).toEqual(
      expect.objectContaining({
        id: '2',
        lastScannedDate: null,
        confidence: 'estimated'
      })
    );
    expect(screen.removeItem('2')).toBe('2');
    expect(screen.rescanItem('2')).toBe('2');
  });
});
