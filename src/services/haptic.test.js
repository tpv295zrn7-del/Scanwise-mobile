import {
  HAPTIC_OPTIONS,
  triggerError,
  triggerNotification,
  triggerSuccess
} from './haptic';

describe('haptic service', () => {
  test('HAPTIC_OPTIONS is exported for compatibility', () => {
    expect(HAPTIC_OPTIONS).toBeDefined();
  });

  test('triggerSuccess is a no-op (haptic disabled for Expo Go)', () => {
    expect(() => triggerSuccess()).not.toThrow();
    expect(triggerSuccess()).toBeUndefined();
  });

  test('triggerError is a no-op (haptic disabled for Expo Go)', () => {
    expect(() => triggerError()).not.toThrow();
    expect(triggerError()).toBeUndefined();
  });

  test('triggerNotification is a no-op (haptic disabled for Expo Go)', () => {
    expect(() => triggerNotification()).not.toThrow();
    expect(triggerNotification()).toBeUndefined();
  });
});
