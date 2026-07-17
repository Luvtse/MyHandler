import { APP_CONFIG } from '@/config/constants';
import { logger } from './logger';
import { errorHandler } from './error-handler';

export interface FileValidationConfig {
  maxFileSize: number; // in bytes
  allowedFileTypes: string[];
  maxFiles: number;
  minImageDimensions?: {
    width: number;
    height: number;
  };
  maxImageDimensions?: {
    width: number;
    height: number;
  };
  scanForMalware: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: {
    size: number;
    type: string;
    dimensions?: {
      width: number;
      height: number;
    };
    hash?: string;
  };
}

class FileValidationService {
  private static instance: FileValidationService;
  private config: FileValidationConfig;

  private constructor() {
    this.config = {
      maxFileSize: APP_CONFIG.maxFileSize,
      allowedFileTypes: APP_CONFIG.allowedFileTypes,
      maxFiles: 10,
      minImageDimensions: {
        width: 100,
        height: 100,
      },
      maxImageDimensions: {
        width: 4096,
        height: 4096,
      },
      scanForMalware: true,
    };
  }

  public static getInstance(): FileValidationService {
    if (!FileValidationService.instance) {
      FileValidationService.instance = new FileValidationService();
    }
    return FileValidationService.instance;
  }

  public async validateFile(file: File): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Basic validations
      if (!this.validateFileType(file)) {
        errors.push(`File type ${file.type} is not allowed`);
      }

      if (!this.validateFileSize(file)) {
        errors.push(`File size exceeds maximum limit of ${this.formatSize(this.config.maxFileSize)}`);
      }

      // Get file metadata
      const metadata = await this.getFileMetadata(file);

      // Image-specific validations
      if (file.type.startsWith('image/')) {
        const imageValidation = await this.validateImage(file);
        errors.push(...imageValidation.errors);
        warnings.push(...imageValidation.warnings);
      }

      // Security validations
      if (this.config.scanForMalware) {
        const securityValidation = await this.validateSecurity(file);
        errors.push(...securityValidation.errors);
        warnings.push(...securityValidation.warnings);
      }

      // Log validation result
      logger.info('File validation completed', 'file-validation', {
        filename: file.name,
        type: file.type,
        size: file.size,
        valid: errors.length === 0,
      });

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        metadata,
      };
    } catch (error) {
      errorHandler.handleError(error);
      return {
        valid: false,
        errors: ['File validation failed'],
        warnings: [],
      };
    }
  }

  public async validateFiles(files: FileList | File[]): Promise<ValidationResult[]> {
    if (files.length > this.config.maxFiles) {
      return [{
        valid: false,
        errors: [`Maximum number of files (${this.config.maxFiles}) exceeded`],
        warnings: [],
      }];
    }

    return Promise.all(Array.from(files).map(file => this.validateFile(file)));
  }

  private validateFileType(file: File): boolean {
    return this.config.allowedFileTypes.includes(file.type);
  }

  private validateFileSize(file: File): boolean {
    return file.size <= this.config.maxFileSize;
  }

  private async validateImage(file: File): Promise<{ errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const dimensions = await this.getImageDimensions(file);

      if (this.config.minImageDimensions) {
        if (dimensions.width < this.config.minImageDimensions.width ||
            dimensions.height < this.config.minImageDimensions.height) {
          errors.push('Image dimensions are too small');
        }
      }

      if (this.config.maxImageDimensions) {
        if (dimensions.width > this.config.maxImageDimensions.width ||
            dimensions.height > this.config.maxImageDimensions.height) {
          errors.push('Image dimensions are too large');
        }
      }

      // Check for common image issues
      if (dimensions.width !== dimensions.height) {
        warnings.push('Image is not square, which may affect display in some areas');
      }

      return { errors, warnings };
    } catch (error) {
      errorHandler.handleError(error);
      return { 
        errors: ['Failed to validate image dimensions'],
        warnings: [],
      };
    }
  }

  private async validateSecurity(file: File): Promise<{ errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check file extension matches content type
      const extension = file.name.split('.').pop()?.toLowerCase();
      const expectedType = this.getExpectedMimeType(extension);
      
      if (expectedType && file.type !== expectedType) {
        errors.push('File extension does not match content type');
      }

      // Check for executable content
      if (await this.containsExecutableContent(file)) {
        errors.push('File may contain executable content');
      }

      // Add more security checks as needed

      return { errors, warnings };
    } catch (error) {
      errorHandler.handleError(error);
      return {
        errors: ['Security validation failed'],
        warnings: [],
      };
    }
  }

  private async getFileMetadata(file: File): Promise<ValidationResult['metadata']> {
    const metadata: ValidationResult['metadata'] = {
      size: file.size,
      type: file.type,
    };

    if (file.type.startsWith('image/')) {
      metadata.dimensions = await this.getImageDimensions(file);
    }

    // Calculate file hash for integrity checking
    metadata.hash = await this.calculateFileHash(file);

    return metadata;
  }

  private getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  private async calculateFileHash(file: File): Promise<string> {
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      errorHandler.handleError(error);
      return '';
    }
  }

  private async containsExecutableContent(file: File): Promise<boolean> {
    try {
      const buffer = await file.arrayBuffer();
      const view = new Uint8Array(buffer);

      // Check for common executable signatures
      const signatures = {
        exe: [0x4D, 0x5A], // MZ
        elf: [0x7F, 0x45, 0x4C, 0x46], // ELF
        script: [0x23, 0x21], // #!
      };

      for (const [type, signature] of Object.entries(signatures)) {
        if (signature.every((byte, i) => view[i] === byte)) {
          return true;
        }
      }

      return false;
    } catch (error) {
      errorHandler.handleError(error);
      return true; // Fail safe
    }
  }

  private getExpectedMimeType(extension?: string): string | null {
    if (!extension) return null;

    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      pdf: 'application/pdf',
      // Add more as needed
    };

    return mimeTypes[extension] || null;
  }

  private formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  public setConfig(config: Partial<FileValidationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): FileValidationConfig {
    return { ...this.config };
  }
}

export const fileValidation = FileValidationService.getInstance();