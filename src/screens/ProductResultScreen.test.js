import { ProductResultScreen } from './ProductResultScreen';

describe('ProductResultScreen', () => {
  test('renders alternatives and supports compare/select', () => {
    const onSelectAlternative = jest.fn();
    const screen = ProductResultScreen({
      product: {
        nutrition: { calories: 200, sugar: 20, sodium: 400, protein: 5 }
      },
      alternatives: [
        {
          id: 'a1',
          name: 'Alt 1',
          brand: 'Brand A',
          nutrition: { calories: 150, sugar: 10, sodium: 300, protein: 8 }
        }
      ],
      userGoals: ['low_sugar'],
      onSelectAlternative
    });

    expect(screen.alternativesTitle).toBe('Alternatives');
    expect(screen.alternatives[0]).toEqual(
      expect.objectContaining({ name: 'Alt 1', goalMatch: true, selected: true })
    );
    expect(screen.compareButtonLabel).toBe('Compare');
    expect(screen.toggleComparison()).toBe(true);
    expect(screen.compareButtonLabel).toBe('Hide Compare');

    const selected = screen.selectAlternative(0);
    expect(selected.id).toBe('a1');
    expect(onSelectAlternative).toHaveBeenCalledWith(expect.objectContaining({ id: 'a1' }));
    expect(screen.currentScan.id).toBe('a1');
  });

  test('save toggle sends haptic and toast', () => {
    const onHaptic = jest.fn();
    const onShowToast = jest.fn();
    const onSaveToggle = jest.fn();

    const screen = ProductResultScreen({
      initiallySaved: false,
      onHaptic,
      onShowToast,
      onSaveToggle
    });

    expect(screen.saveButtonLabel).toBe('Save');
    expect(screen.toggleSave()).toBe(true);
    expect(screen.saveButtonLabel).toBe('Unsave');

    expect(onHaptic).toHaveBeenCalled();
    expect(onSaveToggle).toHaveBeenCalledWith(true);
    expect(onShowToast).toHaveBeenCalledWith('Saved to bookmarks');
  });

  test('handles additional goal matching and invalid alternative selection', () => {
    const onCompareToggle = jest.fn();
    const screen = ProductResultScreen({
      product: {
        nutrition: { calories: 100, sugar: 5, sodium: 500, protein: 2 }
      },
      alternatives: [
        {
          id: 'alt',
          nutrition: { calories: 90, sugar: 8, sodium: 100, protein: 10 }
        }
      ],
      userGoals: ['low_sodium', 'high_protein', 'unknown_goal'],
      onCompareToggle
    });

    expect(screen.alternatives[0].goalMatch).toBe(true);
    expect(screen.selectAlternative(-1)).toBeNull();
    expect(screen.toggleComparison()).toBe(true);
    expect(onCompareToggle).toHaveBeenCalledWith(true);
  });

  test('handles no alternatives and toggles unsave state without callbacks', () => {
    const screen = ProductResultScreen({
      product: { nutrition: {} },
      alternatives: [],
      userGoals: ['low_sugar']
    });

    expect(screen.selectedAlternative).toBeNull();
    expect(screen.selectedIndex).toBe(0);
    expect(screen.comparisonVisible).toBe(false);
    expect(screen.selectAlternative(0)).toBeNull();

    expect(screen.toggleSave()).toBe(true);
    expect(screen.toggleSave()).toBe(false);
    expect(screen.saveButtonLabel).toBe('Save');
  });

  test('goal matching can return false for unmatched goals', () => {
    const screen = ProductResultScreen({
      product: {
        nutrition: { calories: 100, sugar: 10, sodium: 100, protein: 20 }
      },
      alternatives: [
        {
          id: 'a1',
          nutrition: { calories: 120, sugar: 12, sodium: 120, protein: 10 }
        }
      ],
      userGoals: ['low_sugar', 'low_sodium', 'high_protein']
    });

    expect(screen.alternatives[0].goalMatch).toBe(false);
  });

  test('unknown goals never match', () => {
    const screen = ProductResultScreen({
      product: { nutrition: { sugar: 10 } },
      alternatives: [{ id: 'x', nutrition: { sugar: 1 } }],
      userGoals: ['unsupported_goal']
    });

    expect(screen.alternatives[0].goalMatch).toBe(false);
  });
});
