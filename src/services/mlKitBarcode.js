// Stub — expo-camera provides built-in barcode scanning now.
// All exports are no-ops that return safe defaults.

export const normalizeConfidence = () => 'estimated';

export const detectBarcodesInFrame = async () => ({
  success: false,
  reason: 'disabled'
});
