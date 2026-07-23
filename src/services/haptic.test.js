const mockTrigger = jest.fn();

jest.mock('react-native-haptic-feedback', () => ({
  trigger: mockTrigger
}));

import {
  HAPTIC_OPTIONS,
  triggerError,
  triggerNotification,
  triggerSuccess
} from './haptic';

describe('haptic service', () => {
  beforeEach(() => {
    mockTrigger.mockClear();
  });

  test('triggerSuccess fires success haptic', () => {
    triggerSuccess();
    expect(mockTrigger).toHaveBeenCalledWith(
      'notificationSuccess',
      HAPTIC_OPTIONS
    );
  });

  test('triggerError fires error haptic', () => {
    triggerError();
    expect(mockTrigger).toHaveBeenCalledWith(
      'notificationError',
      HAPTIC_OPTIONS
    );
  });

  test('triggerNotification fires notification haptic', () => {
    triggerNotification();
    expect(mockTrigger).toHaveBeenCalledWith('impactLight', HAPTIC_OPTIONS);
  });
});
