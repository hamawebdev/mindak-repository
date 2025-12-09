import { injectable } from 'inversify';
import multer from 'multer';
import type { Request, RequestHandler } from 'express';

export interface IUploadMiddleware {
  single(fieldName: string): RequestHandler;
  singleWithOptions(fieldName: string, options: { maxSizeMb?: number; allowAllImageFormats?: boolean }): RequestHandler;
  getMulter(): multer.Multer;
}

@injectable()
export class UploadMiddleware implements IUploadMiddleware {
  private readonly multerInstance: multer.Multer;

  constructor() {
    // Configure multer to use memory storage
    const storage = multer.memoryStorage();

    // File filter to only allow images
    const fileFilter = (
      _req: Request,
      file: Express.Multer.File,
      cb: multer.FileFilterCallback
    ) => {
      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
      ];

      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only image files are allowed.'));
      }
    };

    this.multerInstance = multer({
      storage,
      fileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
      },
    });
  }

  single(fieldName: string) {
    return this.multerInstance.single(fieldName);
  }

  singleWithOptions(fieldName: string, options: { maxSizeMb?: number; allowAllImageFormats?: boolean }) {
    const { maxSizeMb = 5, allowAllImageFormats = false } = options;

    const storage = multer.memoryStorage();

    const fileFilter = (
      _req: Request,
      file: Express.Multer.File,
      cb: multer.FileFilterCallback
    ) => {
      if (allowAllImageFormats) {
        // Accept any image/* MIME type
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type. Only image files are allowed.'));
        }
      } else {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp',
          'image/svg+xml',
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type. Only image files are allowed.'));
        }
      }
    };

    const customMulter = multer({
      storage,
      fileFilter,
      limits: {
        fileSize: maxSizeMb * 1024 * 1024,
      },
    });

    return customMulter.single(fieldName);
  }

  getMulter() {
    return this.multerInstance;
  }
}
