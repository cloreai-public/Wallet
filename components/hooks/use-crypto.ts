const bcrypt = require('bcryptjs');
import aesjs from 'aes-js';
import pbkdf2 from 'pbkdf2';

// ----------------------------------------------------------------------

export async function encrypt(mnemonic: string, password: string) {
  try {
    const saltRounds = 12;

    // Handle mnemonic encryption
    const mnemonicSalt = await bcrypt.genSaltSync(saltRounds);
    const derivedKey = deriveKey(password, mnemonicSalt);
    const aesCtr = new aesjs.ModeOfOperation.ctr(
      derivedKey,
      new aesjs.Counter(password.length),
    );
    const mnemonicBytes = aesjs.utils.utf8.toBytes(mnemonic);
    const encryptedBytes = aesCtr.encrypt(mnemonicBytes);
    const encryptedMnemonic = aesjs.utils.hex.fromBytes(encryptedBytes);

    // Handle password encryption
    const passSalt = await bcrypt.genSaltSync(saltRounds);
    const passKey = deriveKey(password, passSalt);
    const aesPassCtr = new aesjs.ModeOfOperation.ctr(
      passKey,
      new aesjs.Counter(password.length),
    );
    const passwordBytes = aesjs.utils.utf8.toBytes(password);
    const encryptedPasswordBytes = aesPassCtr.encrypt(passwordBytes);
    const encryptedPassword = aesjs.utils.hex.fromBytes(encryptedPasswordBytes);

    return {
      error: false,
      encryptedMnemonic,
      mnemonicSalt,
      encryptedPassword,
      passSalt,
    };
  } catch (error) {
    console.error(error);
    return {
      error: true,
      encryptedMnemonic: '',
      mnemonicSalt: '',
      encryptedPassword: '',
      passSalt: '',
    };
  }
}

export async function decrypt(
  encryptedString: string,
  password: string,
  salt: string,
) {
  try {
    // When ready to decrypt the hex string, convert it back to bytes
    const encryptedBytes = aesjs.utils.hex.toBytes(encryptedString);
    const passKey = deriveKey(password, salt);
    const aesCtr = new aesjs.ModeOfOperation.ctr(
      passKey,
      new aesjs.Counter(password.length),
    );
    const decryptedBytes = aesCtr.decrypt(encryptedBytes);
    const decryptedString = aesjs.utils.utf8.fromBytes(decryptedBytes);

    return decryptedString;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function verifyPassword(
  password: string,
  passSalt: string,
  encryptedPassword: string,
) {
  try {
    const passKey = deriveKey(password, passSalt);
    const aesCtr = new aesjs.ModeOfOperation.ctr(
      passKey,
      new aesjs.Counter(password.length),
    );

    const encryptedBytes = aesjs.utils.hex.toBytes(encryptedPassword);
    const decryptedBytes = aesCtr.decrypt(encryptedBytes);
    const decryptedPassword = aesjs.utils.utf8.fromBytes(decryptedBytes);
    const result = decryptedPassword === password;

    return result;
  } catch (error) {
    console.error(error);
    return false;
  }
}

function deriveKey(password: string, salt: string) {
  // 10k mac m1 Chrome ~7s
  return pbkdf2.pbkdf2Sync(password, salt, 10000, 32, 'sha512');
}