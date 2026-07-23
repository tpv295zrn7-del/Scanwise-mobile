export const ScanOverlay = ({ text = 'Align barcode within frame' } = {}) => ({
  type: 'scan-overlay',
  frame: 'barcode-frame',
  corners: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
  instructionText: text
});
