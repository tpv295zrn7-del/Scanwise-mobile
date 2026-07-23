import { COLORS } from '../utils/constants';

const badges = {
  verified: {
    source: require('../assets/verified-badge.png'),
    bg: COLORS.verifiedBg,
    text: COLORS.verifiedText
  },
  estimated: {
    source: require('../assets/estimated-badge.png'),
    bg: COLORS.estimatedBg,
    text: COLORS.estimatedText
  },
  incomplete: {
    source: require('../assets/incomplete-badge.png'),
    bg: COLORS.incompleteBg,
    text: COLORS.incompleteText
  }
};

export const ConfidenceBadge = ({ type = 'verified', size = 80 }) => ({
  type: 'ConfidenceBadge',
  props: { ...badges[type], size }
});
