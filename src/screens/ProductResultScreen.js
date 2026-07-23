import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { FormButton } from '../components/FormButton';

export const ProductResultScreen = ({
  scanResult,
  product,
  confidence = 'verified'
} = {}) => {
  const result = scanResult || product || {};
  const resolvedConfidence = result.confidence || confidence;
  const saveIcon = require('../assets/icon-save.png');
  const compareIcon = require('../assets/icon-compare.png');
  const correctIcon = require('../assets/icon-correct.png');

  return {
    badge: ConfidenceBadge({ type: resolvedConfidence }),
    saveIcon,
    compareIcon,
    correctIcon,
    productName: result.name || 'Unknown Product',
    brand: result.brand || 'Unknown Brand',
    barcode: result.barcode || null,
    confidence: resolvedConfidence,
    nutritionInfo: result.nutritionInfo || 'Nutrition information coming soon.',
    saveButton: FormButton({ title: 'Save', leftIcon: saveIcon }),
    compareButton: FormButton({ title: 'Compare', leftIcon: compareIcon }),
    correctButton: FormButton({ title: 'Correct', leftIcon: correctIcon })
  };
};
