/**
 * File processing utilities for Prism Intelligence
 * These functions handle common file operations with proper error handling
 * Think of these as your reliable file management assistants
 */

import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';
import { logger } from './logger';

export interface FileInfo {
  name: string;
  size: number;
  extension: string;
  mimeType: string;
  hash: string;
  path?: string;
}

/**
 * Extract comprehensive information about a file
 * This is like having a file inspector that tells you everything important
 */
export async function getFileInfo(filePath: string): Promise<FileInfo> {
  try {
    const stats = await fs.stat(filePath);
    const extension = path.extname(filePath).toLowerCase();
    const name = path.basename(filePath);
    
    // Calculate file hash for integrity checking
    const buffer = await fs.readFile(filePath);
    const hash = createHash('sha256').update(buffer).digest('hex');
    
    // Determine MIME type based on extension
    const mimeType = getMimeType(extension);
    
    return {
      name,
      size: stats.size,
      extension,
      mimeType,
      hash,
      path: filePath
    };
  } catch (error) {
    logger.error('Failed to get file info', { filePath, error });
    throw new Error(`Unable to read file information: ${error}`);
  }
}

/**
 * Determine MIME type from file extension
 * This helps us understand what kind of file we're working with
 */
function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.xls': 'application/vnd.ms-excel',
    '.csv': 'text/csv',
    '.txt': 'text/plain',
    '.json': 'application/json'
  };
  
  return mimeTypes[extension] || 'application/octet-stream';
}
