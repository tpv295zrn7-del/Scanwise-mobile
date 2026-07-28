import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { FormButton } from '../components/FormButton';
import React from 'react';

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
    get productName() {
      return activeScan.name || 'Unknown Product';
    },
    get brand() {
      return activeScan.brand || 'Unknown Brand';
    },
    get barcode() {
      return activeScan.barcode || null;
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

/* istanbul ignore next */
export const ProductResultScreenView = ({ navigation, route }) => {
  const { Button, FlatList, Text, View } = require('react-native');
  const { useDispatch, useSelector } = require('react-redux');
  const {
    addToSavedItems,
    removeSavedItem,
    selectIsSaved
  } = require('../redux/slices/savedItemsSlice');
  const { useState } = require('react');
  const dispatch = useDispatch();
  const params = route?.params || {};
  const scanResult = params.scanResult || params.result || {};
  const alreadySaved = useSelector(selectIsSaved(scanResult.id));
  const [saved, setSaved] = useState(alreadySaved);

  const model = ProductResultScreen({
    scanResult,
    currentScan: scanResult,
    alternatives: params.alternatives || [],
    initiallySaved: alreadySaved,
    onCompareToggle: (visible) => visible,
    onSaveToggle: (isSaved) => {
      if (isSaved) {
        dispatch(addToSavedItems(scanResult));
      } else {
        dispatch(removeSavedItem(scanResult.id));
      }
      setSaved(isSaved);
    }
  });

  return React.createElement(
    View,
    { style: { flex: 1, padding: 16, gap: 10 } },
    React.createElement(Text, null, model.productName),
    React.createElement(Text, null, model.brand),
    React.createElement(Text, null, `Confidence: ${model.confidence}`),
    React.createElement(Button, {
      title: saved ? 'Unsave' : 'Save',
      onPress: () => model.toggleSave()
    }),
    React.createElement(Button, {
      title: 'Compare',
      onPress: () => model.toggleComparison()
    }),
    React.createElement(Button, {
      title: 'Correction',
      onPress: () =>
        navigation.navigate('CorrectionSubmission', { barcode: model.barcode })
    }),
    React.createElement(Button, {
      title: 'Open Comparison',
      onPress: () =>
        navigation.navigate('Comparison', {
          original: model.currentScan,
          alternative: model.selectedAlternative
        })
    }),
    React.createElement(FlatList, {
      data: model.alternatives,
      keyExtractor: (_, index) => `alt-${index}`,
      renderItem: ({ item, index }) =>
        React.createElement(
          Text,
          {
            onPress: () => model.selectAlternative(index),
            style: { paddingVertical: 8 }
          },
          item.name || `Alternative ${index + 1}`
        )
    })
  );
};
