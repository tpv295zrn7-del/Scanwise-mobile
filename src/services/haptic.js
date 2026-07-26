// Haptic feedback disabled for Expo Go compatibility.
// react-native-haptic-feedback requires a native module (RNHapticFeedback)
// not available in Expo Go. All functions are no-ops to prevent crashes.

const noop = () => undefined;

export const HAPTIC_OPTIONS = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false
};

export const triggerSuccess = noop;
export const triggerError = noop;
export const triggerNotification = noop;
