import { triggerNotification } from '../services/haptic';

export const CancelButton = ({ onPress } = {}) => ({
  type: 'cancel-button',
  title: 'Cancel',
  onPress: () => {
    triggerNotification();
    if (onPress) {
      onPress();
    }
  }
});
