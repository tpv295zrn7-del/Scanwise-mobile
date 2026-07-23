import { configureStore } from '@reduxjs/toolkit';
import reducer, {
  alternativesThunk,
  clearError,
  selectAlternatives,
  selectSelectedAlternative,
  setAlternatives,
  setSelectedAlternative
} from './slices/alternativesSlice';
import { endpoints } from '../services/api';

jest.mock('../services/api', () => ({
  endpoints: { getAlternatives: jest.fn() }
}));

describe('alternativesSlice', () => {
  const store = () => configureStore({ reducer: { alternatives: reducer } });

  test('reducers and selectors', () => {
    const s = store();
    expect(selectSelectedAlternative(s.getState())).toBeNull();
    s.dispatch(setAlternatives([{ id: 'a' }, { id: 'b' }]));
    s.dispatch(setSelectedAlternative(1));

    expect(selectAlternatives(s.getState())).toHaveLength(2);
    expect(selectSelectedAlternative(s.getState()).id).toBe('b');

    s.dispatch(setSelectedAlternative(10));
    expect(selectSelectedAlternative(s.getState()).id).toBe('b');

    s.dispatch(clearError());
    expect(s.getState().alternatives.error).toBeNull();

    s.dispatch(setAlternatives(null));
    expect(selectAlternatives(s.getState())).toEqual([]);
  });

  test('alternativesThunk success', async () => {
    endpoints.getAlternatives.mockResolvedValue({ data: [{ id: 'alt-1' }] });

    const s = store();
    await s.dispatch(alternativesThunk('123'));

    expect(endpoints.getAlternatives).toHaveBeenCalledWith('123');
    expect(s.getState().alternatives.list[0].id).toBe('alt-1');
    expect(s.getState().alternatives.loading).toBe(false);
  });

  test('alternativesThunk failure', async () => {
    endpoints.getAlternatives.mockRejectedValueOnce(new Error('bad alternatives'));

    const s = store();
    await s.dispatch(alternativesThunk('123'));

    expect(s.getState().alternatives.error).toBe('bad alternatives');
    expect(s.getState().alternatives.loading).toBe(false);
  });

  test('alternativesThunk handles non-array response', async () => {
    endpoints.getAlternatives.mockResolvedValueOnce({ data: { id: 'x' } });

    const s = store();
    await s.dispatch(alternativesThunk('123'));

    expect(s.getState().alternatives.list).toEqual([]);
  });
});
