/**
 * Cryptographic utility using standard Web Crypto API
 * Provides SHA-256 password hashing with salt and AES-GCM payload encryption.
 */

// Hash password with salt using SHA-256
export async function hashPassword(password: string, salt = 'gameszone_salt_2026'): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    // Fallback synchronous hash for SSR
    let hash = 0;
    const str = password + salt;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return `hash_${Math.abs(hash).toString(16)}`;
  }

  const enc = new TextEncoder();
  const data = enc.encode(password + salt);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Encrypt sensitive user data using AES-GCM
export async function encryptData(plainText: string, secretKey = 'gameszone_master_key'): Promise<string> {
  try {
    if (typeof window === 'undefined' || !window.crypto?.subtle) {
      return btoa(plainText); // Simple base64 fallback for SSR
    }

    const enc = new TextEncoder();
    const keyData = enc.encode(secretKey.padEnd(32, '0').slice(0, 32));
    const key = await window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(plainText)
    );

    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch (e) {
    console.error('Encryption error:', e);
    return plainText;
  }
}

// Decrypt sensitive user data using AES-GCM
export async function decryptData(cipherText: string, secretKey = 'gameszone_master_key'): Promise<string> {
  try {
    if (typeof window === 'undefined' || !window.crypto?.subtle) {
      return atob(cipherText);
    }

    const binary = atob(cipherText);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const iv = bytes.slice(0, 12);
    const data = bytes.slice(12);

    const enc = new TextEncoder();
    const keyData = enc.encode(secretKey.padEnd(32, '0').slice(0, 32));
    const key = await window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    return new TextDecoder().decode(decrypted);
  } catch (e) {
    console.error('Decryption error:', e);
    return cipherText;
  }
}
