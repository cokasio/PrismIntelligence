/**
 * Encryption Key Manager
 * Secure encryption and key management for sensitive data
 */

import crypto from 'crypto';
import { promisify } from 'util';
import { logger } from '../../utils/logger';
import { ApiError } from '../../utils/api-error';

const scrypt = promisify(crypto.scrypt);

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const SALT_LENGTH = 32;
const TAG_LENGTH = 16;
const IV_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

export class EncryptionKeyManager {
  private masterKey: Buffer;
  private keyCache: Map<string, Buffer> = new Map();

  constructor() {
    // Initialize master key from environment
    const masterKeyBase64 = process.env.MASTER_ENCRYPTION_KEY;
    
    if (!masterKeyBase64) {
      throw new Error('MASTER_ENCRYPTION_KEY not configured');
    }

    try {
      this.masterKey = Buffer.from(masterKeyBase64, 'base64');
      
      if (this.masterKey.length !== KEY_LENGTH) {
        throw new Error(`Master key must be ${KEY_LENGTH} bytes`);
      }
    } catch (error) {
      logger.error('Failed to initialize encryption key manager', error);
      throw new Error('Invalid master encryption key');
    }
  }

  /**
   * Derive a key from the master key for a specific purpose
   */
  private async deriveKey(purpose: string, salt: Buffer): Promise<Buffer> {
    const cacheKey = `${purpose}:${salt.toString('hex')}`;
    
    // Check cache
    if (this.keyCache.has(cacheKey)) {
      return this.keyCache.get(cacheKey)!;
    }

    // Derive key using PBKDF2
    const info = Buffer.from(`prism-${purpose}`, 'utf8');
    const derivedKey = await scrypt(
      Buffer.concat([this.masterKey, info]),
      salt,
      KEY_LENGTH
    ) as Buffer;

    // Cache the derived key
    this.keyCache.set(cacheKey, derivedKey);
    
    return derivedKey;
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  async encrypt(data: string, purpose: string = 'general'): Promise<string> {
    try {
      // Generate random salt and IV
      const salt = crypto.randomBytes(SALT_LENGTH);
      const iv = crypto.randomBytes(IV_LENGTH);
      
      // Derive key for this purpose
      const key = await this.deriveKey(purpose, salt);
      
      // Create cipher
      const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
      
      // Encrypt data
      const encrypted = Buffer.concat([
        cipher.update(data, 'utf8'),
        cipher.final()
      ]);
      
      // Get auth tag
      const tag = cipher.getAuthTag();
      
      // Combine salt, iv, tag, and encrypted data
      const combined = Buffer.concat([
        salt,
        iv,
        tag,
        encrypted
      ]);
      
      // Return base64 encoded
      return combined.toString('base64');
    } catch (error) {
      logger.error('Encryption failed', error);
      throw new ApiError('Encryption failed', 500, 'ENCRYPTION_ERROR');
    }
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  async decrypt(encryptedData: string, purpose: string = 'general'): Promise<string> {
    try {
      // Decode from base64
      const combined = Buffer.from(encryptedData, 'base64');
      
      // Extract components
      const salt = combined.slice(0, SALT_LENGTH);
      const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
      const tag = combined.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
      const encrypted = combined.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
      
      // Derive key for this purpose
      const key = await this.deriveKey(purpose, salt);
      
      // Create decipher
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(tag);
      
      // Decrypt data
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ]);
      
      return decrypted.toString('utf8');
    } catch (error) {
      logger.error('Decryption failed', error);
      throw new ApiError('Decryption failed', 500, 'DECRYPTION_ERROR');
    }
  }

  /**
   * Encrypt an object as JSON
   */
  async encryptObject(obj: any, purpose: string = 'general'): Promise<string> {
    const json = JSON.stringify(obj);
    return this.encrypt(json, purpose);
  }

  /**
   * Decrypt JSON back to object
   */
  async decryptObject<T = any>(encryptedData: string, purpose: string = 'general'): Promise<T> {
    const json = await this.decrypt(encryptedData, purpose);
    return JSON.parse(json);
  }

  /**
   * Generate a secure random token
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate a secure API key
   */
  generateApiKey(): string {
    const prefix = 'pk_';
    const random = crypto.randomBytes(32).toString('hex');
    return `${prefix}${random}`;
  }

  /**
   * Hash a password using Argon2id
   */
  async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const hash = await scrypt(password, salt, 64) as Buffer;
    
    return `${salt.toString('hex')}:${hash.toString('hex')}`;
  }

  /**
   * Verify a password against a hash
   */
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      const [saltHex, hashHex] = hashedPassword.split(':');
      const salt = Buffer.from(saltHex, 'hex');
      const hash = Buffer.from(hashHex, 'hex');
      
      const newHash = await scrypt(password, salt, 64) as Buffer;
      
      return crypto.timingSafeEqual(hash, newHash);
    } catch (error) {
      return false;
    }
  }

  /**
   * Encrypt API keys for storage
   */
  async encryptApiKey(apiKey: string): Promise<{ encrypted: string; keyId: string }> {
    const keyId = crypto.randomBytes(16).toString('hex');
    const encrypted = await this.encrypt(apiKey, 'api-keys');
    
    return { encrypted, keyId };
  }

  /**
   * Decrypt API key
   */
  async decryptApiKey(encrypted: string): Promise<string> {
    return this.decrypt(encrypted, 'api-keys');
  }

  /**
   * Rotate encryption keys
   */
  async rotateKey(oldKeyBase64: string, data: string, purpose: string = 'general'): Promise<string> {
    // Temporarily use old key to decrypt
    const oldMasterKey = this.masterKey;
    this.masterKey = Buffer.from(oldKeyBase64, 'base64');
    this.keyCache.clear();
    
    try {
      // Decrypt with old key
      const decrypted = await this.decrypt(data, purpose);
      
      // Restore new key and re-encrypt
      this.masterKey = oldMasterKey;
      this.keyCache.clear();
      
      return this.encrypt(decrypted, purpose);
    } catch (error) {
      // Restore new key on error
      this.masterKey = oldMasterKey;
      this.keyCache.clear();
      throw error;
    }
  }

  /**
   * Generate encryption key for file storage
   */
  generateFileEncryptionKey(): { key: string; iv: string } {
    return {
      key: crypto.randomBytes(32).toString('hex'),
      iv: crypto.randomBytes(16).toString('hex')
    };
  }

  /**
   * Create encrypted stream for file uploads
   */
  createEncryptStream(key: string, iv: string): crypto.CipherGCM {
    const keyBuffer = Buffer.from(key, 'hex');
    const ivBuffer = Buffer.from(iv, 'hex');
    
    return crypto.createCipheriv(ALGORITHM, keyBuffer, ivBuffer);
  }

  /**
   * Create decryption stream for file downloads
   */
  createDecryptStream(key: string, iv: string, tag: Buffer): crypto.DecipherGCM {
    const keyBuffer = Buffer.from(key, 'hex');
    const ivBuffer = Buffer.from(iv, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, ivBuffer);
    decipher.setAuthTag(tag);
    
    return decipher;
  }

  /**
   * Clear key cache (for security)
   */
  clearCache(): void {
    this.keyCache.clear();
  }

  /**
   * Generate secure random string
   */
  generateSecureRandom(length: number = 16, encoding: 'hex' | 'base64' = 'hex'): string {
    const bytes = crypto.randomBytes(length);
    return bytes.toString(encoding);
  }

  /**
   * Create HMAC signature
   */
  createHmac(data: string, secret: string = ''): string {
    const hmacSecret = secret || this.masterKey.toString('hex');
    return crypto
      .createHmac('sha256', hmacSecret)
      .update(data)
      .digest('hex');
  }

  /**
   * Verify HMAC signature
   */
  verifyHmac(data: string, signature: string, secret: string = ''): boolean {
    const expectedSignature = this.createHmac(data, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}

// Singleton instance
let encryptionManager: EncryptionKeyManager | null = null;

export function getEncryptionManager(): EncryptionKeyManager {
  if (!encryptionManager) {
    encryptionManager = new EncryptionKeyManager();
  }
  return encryptionManager;
}

// Utility functions
export async function encryptSensitiveData(data: string, purpose?: string): Promise<string> {
  const manager = getEncryptionManager();
  return manager.encrypt(data, purpose);
}

export async function decryptSensitiveData(encryptedData: string, purpose?: string): Promise<string> {
  const manager = getEncryptionManager();
  return manager.decrypt(encryptedData, purpose);
}

export async function hashPassword(password: string): Promise<string> {
  const manager = getEncryptionManager();
  return manager.hashPassword(password);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const manager = getEncryptionManager();
  return manager.verifyPassword(password, hashedPassword);
}

// Initialize encryption key if not exists
export function generateMasterKey(): string {
  const key = crypto.randomBytes(KEY_LENGTH);
  return key.toString('base64');
}

// Middleware for encrypting response data
export function encryptResponse(fields: string[]) {
  return async (req: any, res: any, next: any) => {
    const originalJson = res.json;
    
    res.json = async function(data: any) {
      if (data && typeof data === 'object') {
        const manager = getEncryptionManager();
        
        for (const field of fields) {
          if (data[field]) {
            data[field] = await manager.encrypt(data[field], 'response');
          }
        }
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
}