import {
  getCameraPermissionModel,
  requestCameraPermission
} from './cameraPermissions';

describe('cameraPermissions service', () => {
  test('requestCameraPermission normalizes statuses', async () => {
    await expect(
      requestCameraPermission({
        requestCameraPermission: jest.fn().mockResolvedValue('authorized')
      })
    ).resolves.toBe('granted');

    await expect(
      requestCameraPermission({
        requestCameraPermission: jest.fn().mockResolvedValue('denied')
      })
    ).resolves.toBe('denied');

    await expect(
      requestCameraPermission({
        requestCameraPermission: jest.fn().mockResolvedValue('blocked')
      })
    ).resolves.toBe('denied');

    await expect(
      requestCameraPermission({
        requestCameraPermission: jest.fn().mockResolvedValue('limited')
      })
    ).resolves.toBe('unknown');

    await expect(requestCameraPermission()).resolves.toBe('denied');
  });

  test('permission model supports manual fallback and settings link', () => {
    expect(
      getCameraPermissionModel({ status: 'granted', cameraAvailable: true })
    ).toEqual(
      expect.objectContaining({ showManualEntry: false, showSettingsLink: false })
    );

    expect(
      getCameraPermissionModel({ status: 'denied', cameraAvailable: true })
    ).toEqual(
      expect.objectContaining({ showManualEntry: true, showSettingsLink: true })
    );

    expect(
      getCameraPermissionModel({
        status: 'denied',
        cameraAvailable: true,
        canOpenSettings: false
      })
    ).toEqual(expect.objectContaining({ showSettingsLink: false }));

    expect(
      getCameraPermissionModel({ status: 'granted', cameraAvailable: false })
    ).toEqual(expect.objectContaining({ showManualEntry: true }));
  });
});
