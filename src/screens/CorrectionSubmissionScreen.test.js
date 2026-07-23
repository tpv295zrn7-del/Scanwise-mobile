import { CorrectionSubmissionScreen } from './CorrectionSubmissionScreen';

describe('CorrectionSubmissionScreen', () => {
  test('submits correction successfully', async () => {
    const submitCorrection = jest.fn().mockResolvedValue({ ok: true });
    const onHaptic = jest.fn();
    const onToast = jest.fn();
    const onBack = jest.fn();

    const screen = CorrectionSubmissionScreen({
      barcode: '123',
      submitCorrection,
      onHaptic,
      onToast,
      onBack
    });

    screen.setReason('Out of stock');
    screen.setDetails('Not available in store');
    screen.setContactInfo('test@example.com');

    await expect(screen.submit()).resolves.toBe(true);
    expect(screen.submitted).toBe(true);
    expect(submitCorrection).toHaveBeenCalledWith('123', {
      reason: 'Out of stock',
      details: 'Not available in store',
      contact: 'test@example.com'
    });
    expect(onHaptic).toHaveBeenCalled();
    expect(onToast).toHaveBeenCalledWith('Correction submitted successfully');

    screen.back();
    expect(onBack).toHaveBeenCalled();
  });

  test('handles submission failure', async () => {
    const onToast = jest.fn();
    const screen = CorrectionSubmissionScreen({
      barcode: '123',
      submitCorrection: jest.fn().mockRejectedValue(new Error('bad request')),
      onToast
    });

    screen.setDetails(null);
    screen.setContactInfo(null);
    await expect(screen.submit()).resolves.toBe(false);
    expect(screen.error).toBe('bad request');
    expect(onToast).toHaveBeenCalledWith('Failed to submit correction');
  });

  test('falls back to default reason and auto-submits when callback missing', async () => {
    const screen = CorrectionSubmissionScreen();
    expect(screen.loading).toBe(false);
    expect(screen.setReason('not-listed')).toBe('Wrong product');
    await expect(screen.submit()).resolves.toBe(true);
    expect(screen.submitted).toBe(true);
  });

  test('shows loading while awaiting submit promise', async () => {
    let resolveSubmit;
    const submitPromise = new Promise((resolve) => {
      resolveSubmit = resolve;
    });
    const screen = CorrectionSubmissionScreen({
      submitCorrection: jest.fn().mockReturnValue(submitPromise)
    });

    const pending = screen.submit();
    expect(screen.loading).toBe(true);
    resolveSubmit({ ok: true });
    await pending;
    expect(screen.loading).toBe(false);
  });
});
