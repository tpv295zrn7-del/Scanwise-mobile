import { createAsyncThunk } from '@reduxjs/toolkit';
import { endpoints } from '../../services/api';

export const normalizeScanConfidence = (value) => {
  const normalized = `${value || ''}`.toLowerCase();
  if (['verified', 'estimated', 'incomplete'].includes(normalized)) {
    return normalized;
  }

  if (['success', 'found'].includes(normalized)) {
    return 'verified';
  }

  if (['partial', 'estimated_match'].includes(normalized)) {
    return 'estimated';
  }

  return 'incomplete';
};

export const scanProductByBarcode = createAsyncThunk(
  'scans/scanProductByBarcode',
  async (barcode) => {
    const response = await endpoints.scanProduct({ barcode });
    return {
      barcode,
      ...response.data,
      confidence: normalizeScanConfidence(
        response.data?.confidence || response.data?.status
      )
    };
  }
);
