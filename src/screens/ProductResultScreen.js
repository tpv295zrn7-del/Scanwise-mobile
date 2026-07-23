import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { FormButton } from '../components/FormButton';

const scoreGoalMatch = (goal = '', comparison = {}) => {
  if (goal === 'low_sugar') return comparison.sugarDelta < 0;
  if (goal === 'low_sodium') return comparison.sodiumDelta < 0;
  if (goal === 'high_protein') return comparison.proteinDelta > 0;
  return false;
};

const compareNutrition = (original = {}, alternative = {}) => {
  const originalNutrition = original.nutrition || {};
  const alternativeNutrition = alternative.nutrition || {};

  return {
    caloriesDelta:
      (alternativeNutrition.calories || 0) - (originalNutrition.calories || 0),
    sugarDelta: (alternativeNutrition.sugar || 0) - (originalNutrition.sugar || 0),
    sodiumDelta:
      (alternativeNutrition.sodium || 0) - (originalNutrition.sodium || 0),
    proteinDelta:
      (alternativeNutrition.protein || 0) - (originalNutrition.protein || 0)
  };
};

export const ProductResultScreen = ({
  scanResult,
  product,
  confidence = 'verified',
  currentScan = null,
  alternatives = [],
  userGoals = [],
  initiallySaved = false,
  onSelectAlternative,
  onSaveToggle,
  onShowToast,
  onHaptic,
  onCompareToggle
} = {}) => {
  const initialProduct = currentScan || scanResult || product || {};
  const resolvedConfidence = initialProduct.confidence || confidence;
  const saveIcon = require('../assets/icon-save.png');
  const compareIcon = require('../assets/icon-compare.png');
  const correctIcon = require('../assets/icon-correct.png');

  let selectedIndex = 0;
  let comparisonVisible = false;
  let saved = initiallySaved;
  let activeScan = initialProduct;

  const hydrateAlternative = (alternative) => {
    const nutritionalComparison = compareNutrition(initialProduct, alternative);
    const goalMatch = userGoals.some((goal) =>
      scoreGoalMatch(goal, nutritionalComparison)
    );

    return {
      ...alternative,
      nutritionalComparison,
      goalMatch
    };
  };

  const getAlternatives = () =>
    alternatives.map((alternativeItem, index) => ({
      ...hydrateAlternative(alternativeItem),
      selected: index === selectedIndex
    }));

  return {
    badge: ConfidenceBadge({ type: resolvedConfidence }),
    saveIcon,
    compareIcon,
    correctIcon,
    productName: activeScan.name || 'Unknown Product',
    brand: activeScan.brand || 'Unknown Brand',
    barcode: activeScan.barcode || null,
    confidence: resolvedConfidence,
    nutritionInfo:
      activeScan.nutritionInfo || 'Nutrition information coming soon.',
    saveButton: FormButton({
      title: saved ? 'Unsave' : 'Save',
      leftIcon: saveIcon
    }),
    compareButton: FormButton({
      title: comparisonVisible ? 'Hide Compare' : 'Compare',
      leftIcon: compareIcon
    }),
    correctButton: FormButton({ title: 'Correct', leftIcon: correctIcon }),
    alternativesTitle: 'Alternatives',
    get alternatives() {
      return getAlternatives();
    },
    get selectedAlternative() {
      return getAlternatives()[selectedIndex] || null;
    },
    get selectedIndex() {
      return selectedIndex;
    },
    get comparisonVisible() {
      return comparisonVisible;
    },
    get compareButtonLabel() {
      return comparisonVisible ? 'Hide Compare' : 'Compare';
    },
    get saveButtonLabel() {
      return saved ? 'Unsave' : 'Save';
    },
    get currentScan() {
      return activeScan;
    },
    toggleComparison() {
      comparisonVisible = !comparisonVisible;
      if (onCompareToggle) {
        onCompareToggle(comparisonVisible);
      }
      return comparisonVisible;
    },
    selectAlternative(index) {
      if (index < 0 || index >= alternatives.length) {
        return null;
      }

      selectedIndex = index;
      activeScan = alternatives[index];
      if (onSelectAlternative) {
        onSelectAlternative(alternatives[index]);
      }
      return alternatives[index];
    },
    toggleSave() {
      saved = !saved;
      if (onHaptic) {
        onHaptic('impactMedium');
      }
      if (onSaveToggle) {
        onSaveToggle(saved);
      }
      if (onShowToast) {
        onShowToast(saved ? 'Saved to bookmarks' : 'Removed from bookmarks');
      }
      return saved;
    }
  };
};
