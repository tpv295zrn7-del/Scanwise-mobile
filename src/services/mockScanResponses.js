export const mockScanResponses = {
  verified: {
    id: 'scan-verified',
    barcode: '0123456789012',
    name: 'Protein Bar',
    brand: 'ScanWise',
    confidence: 'verified'
  },
  estimated: {
    id: 'scan-estimated',
    barcode: '0987654321098',
    name: 'Oat Cereal',
    brand: 'Fit Foods',
    confidence: 'estimated'
  },
  incomplete: {
    id: 'scan-incomplete',
    barcode: '1111111111111',
    name: 'Unknown Product',
    brand: 'Unknown',
    confidence: 'incomplete'
  }
};

export const mockAlternativesResponse = [
  {
    id: 'alt-1',
    name: 'Lower Sugar Protein Bar',
    brand: 'ScanWise',
    confidence: 'verified'
  }
];

export const mockCorrectionsResponse = {
  status: 'submitted'
};
