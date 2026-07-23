const getHapticModule = () => {
  try {
    const module = require('react-native-haptic-feedback');
    return module.default || module;
  } catch (_error) {
    return { trigger: () => undefined };
  }
};

export const HAPTIC_OPTIONS = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false
};

const trigger = (type) => getHapticModule().trigger(type, HAPTIC_OPTIONS);

export const triggerSuccess = () => trigger('notificationSuccess');
export const triggerError = () => trigger('notificationError');
export const triggerNotification = () => trigger('impactLight');
