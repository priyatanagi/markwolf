/**
 * Client-Side End-to-End Encryption (E2EE) using Web Crypto API.
 * Employs AES-GCM 256-bit with PBKDF2 key derivation (100,000 iterations, SHA-256).
 * Data is encrypted locally before storage or cloud synchronization.
 */

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptText(
  plainText: string,
  passphrase: string
): Promise<{ cipherText: string; salt: string; iv: string }> {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);

  const enc = new TextEncoder();
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    enc.encode(plainText)
  );

  return {
    cipherText: arrayBufferToBase64(encryptedBuffer),
    salt: arrayBufferToBase64(salt.buffer),
    iv: arrayBufferToBase64(iv.buffer),
  };
}

export async function decryptText(
  cipherText: string,
  saltBase64: string,
  ivBase64: string,
  passphrase: string
): Promise<string> {
  const salt = new Uint8Array(base64ToArrayBuffer(saltBase64));
  const iv = new Uint8Array(base64ToArrayBuffer(ivBase64));
  const encryptedData = base64ToArrayBuffer(cipherText);
  const key = await deriveKey(passphrase, salt);

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      encryptedData
    );
    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch {
    throw new Error('Decryption failed. Incorrect passphrase or corrupted data.');
  }
}
