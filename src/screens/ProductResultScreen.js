import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { FormButton } from '../components/FormButton';
import { saveItem } from '../redux/slices/savedItemsSlice';

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
  dispatch,
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
  onCompareToggle,
  onCompare
} = {}) => {
  const initialProduct = currentScan || scanResult || product || {};
  const resolvedConfidence = initialProduct.confidence || confidence;

  // ── Determine display states ─────────────────────────────────────
  // The renderer (ProductResultView) will handle the API fetch via useEffect.
  // We just flag whether a lookup is needed so the renderer can show a spinner.
  const hasBarcode = !!initialProduct.barcode;
  const hasNoProductData =
    !initialProduct.name || initialProduct.name === 'Unknown Product';
  const isSearching = hasBarcode && hasNoProductData;

  // ── Resolve active product data ──────────────────────────────────
  const activeProduct = initialProduct;

  const saveIcon = require('../assets/icon-save.png');
  const compareIcon = require('../assets/icon-compare.png');
  const correctIcon = require('../assets/icon-correct.png');

  let selectedIndex = 0;
  let comparisonVisible = false;
  let saved = initiallySaved;
  let activeScan = activeProduct;

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
    get productName() {
      return activeScan.name || 'Unknown Product';
    },
    get brand() {
      return activeScan.brand || 'Unknown Brand';
    },
    get barcode() {
      return activeScan.barcode || null;
    },
    get image() {
      return activeScan.image || null;
    },
    get nutriscore() {
      return activeScan.nutriscore || null;
    },
    get categories() {
      return activeScan.categories || '';
    },
    get ingredients() {
      return activeScan.ingredients || '';
    },
    confidence: resolvedConfidence,
    get nutritionInfo() {
      return activeScan.nutritionInfo || 'Nutrition information coming soon.';
    },
    saveButton: FormButton({
      title: saved ? 'Unsave' : 'Save',
      leftIcon: saveIcon
    }),
    compareButton: FormButton({
      title: comparisonVisible ? 'Hide Compare' : 'Compare',
      leftIcon: compareIcon,
      onPress: () => {
        if (onCompare) {
          onCompare(initialProduct.barcode);
        } else if (onCompareToggle) {
          onCompareToggle(!comparisonVisible);
        }
      }
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
    // ── Product lookup states for the renderer ────────────────────
    get searching() {
      return isSearching;
    },
    get isSearching() {
      return isSearching;
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
      if (dispatch) {
        dispatch(
          saveItem({
            barcode: activeScan.barcode || activeScan.id,
            productName: activeScan.name || 'Unknown Product',
            brand: activeScan.brand || 'Unknown Brand',
            image: activeScan.image || null,
            nutriscore: activeScan.nutriscore || null,
            category: activeScan.categories || '',
            timestamp: new Date().toISOString(),
          })
        );
      }
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
