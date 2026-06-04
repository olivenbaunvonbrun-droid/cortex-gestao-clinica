import CryptoJS from 'crypto-js';

const SECRET_KEY = 'rid-app-secure-vault-key-2024';

export const encryption = {
  encrypt: (text: string): string => {
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
  },
  
  decrypt: (cipherText: string): string => {
    try {
      const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      return '';
    }
  }
};
