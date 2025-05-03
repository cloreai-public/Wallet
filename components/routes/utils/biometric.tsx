import {
  AndroidBiometryStrength,
  BiometricAuth,
  BiometryError,
  BiometryErrorType,
} from '@aparajita/capacitor-biometric-auth';

import { SecureStorage } from '@aparajita/capacitor-secure-storage';

/**
 * Check if biometric authentication is available.
 */
export const isBiometric = async () => {
  try {
    const result = await BiometricAuth.checkBiometry();
    return result.isAvailable;
  } catch (error) {
    console.error('Error checking biometry availability:', error);
    return false;
  }
};

export default isBiometric;

/**
 * Attempt to authenticate using biometrics.
 */
export const verifyBiometric = async () => {
  try {
    await BiometricAuth.authenticate({
      reason: 'Please authenticate',
      cancelTitle: 'Cancel',
      allowDeviceCredential: true,
      iosFallbackTitle: 'Use passcode',
      androidTitle: 'Biometric login',
      androidSubtitle: 'Log in using biometric authentication',
      androidConfirmationRequired: false,
      androidBiometryStrength: AndroidBiometryStrength.weak,
    });
    return true;
  } catch (e) {
    console.error('Biometric authentication failed:', e);
    return false;
  }
};

/**
 * Save user credentials in secure storage.
 */
export const saveBiometric = async (username: string, password: string) => {
  try {
    await SecureStorage.setItem(
      'www.clore.ai',
      JSON.stringify({ username, password })
    );
  } catch (error) {
    console.error('Failed to save credentials:', error);
  }
};

/**
 * Retrieve user credentials from secure storage.
 */
export const getBiometric = async () => {
  try {
    const res = await SecureStorage.getItem('www.clore.ai');
    return res ? JSON.parse(res) : null;
  } catch (error) {
    console.error('Failed to retrieve credentials:', error);
    return null;
  }
};

/**
 * Remove user credentials from secure storage.
 */
export const removeBiometric = async () => {
  try {
    await SecureStorage.remove('www.clore.ai');
  } catch (error) {
    console.error('Failed to remove credentials:', error);
  }
};

/**
 * Generate a random password.
 */
export const generatePassword = () => {
  return crypto.randomUUID(); // Using crypto for a unique string, replace if more complexity needed
};
