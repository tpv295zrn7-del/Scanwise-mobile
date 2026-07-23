import { ConfidenceBadge } from '../components/ConfidenceBadge';

export const ProductResultScreen = ({ confidence = 'verified' }) => ({
  badge: ConfidenceBadge({ type: confidence }),
  saveIcon: require('../assets/icon-save.png'),
  compareIcon: require('../assets/icon-compare.png')
});
