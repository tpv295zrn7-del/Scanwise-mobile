import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { FormButton } from '../components/FormButton';
import { lookupProductByBarcode } from '../redux/thunks/scanThunk';

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
  state = {},
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

  // ── Product lookup from Redux state ──────────────────────────────
  const scansState = state.scans || {};
  const productLoading = scansState.productLoading;
  const productData = scansState.productData;
  const productError = scansState.productError;
  const productNotFound = scansState.productNotFound;

  const hasBarcode = !!initialProduct.barcode;
  const hasNoProductData =
    !initialProduct.name || initialProduct.name === 'Unknown Product';

  // Determine whether we need to trigger an Open Food Facts lookup
  const needsLookup =
    hasBarcode &&
    hasNoProductData &&
    !productLoading &&
    !productData &&
    !productError &&
    !productNotFound &&
    typeof dispatch === 'function';

  // Trigger the lookup via dispatch (guarded by needsLookup to prevent repeats)
  if (needsLookup) {
    dispatch(lookupProductByBarcode(initialProduct.barcode));
  }

  // ── Resolve active product data ──────────────────────────────────
  // If we have product data from the API, use it; otherwise fall back to initial
  const activeProduct = productData
    ? { ...initialProduct, ...productData, confidence: resolvedConfidence }
    : initialProduct;

  // ── Display states ───────────────────────────────────────────────
  const lookupError = productError && !productNotFound;
  const isSearching =
    productLoading || (hasBarcode && hasNoProductData && !productError && !productNotFound);

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
    // ── Product lookup states for the renderer ────────────────────
    get searching() {
      return isSearching;
    },
    get isSearching() {
      return isSearching;
    },
    get loading() {
      return productLoading;
    },
    get lookupError() {
      return lookupError;
    },
    get notFound() {
      return productNotFound;
    },
    get errorMessage() {
      return productError || null;
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
