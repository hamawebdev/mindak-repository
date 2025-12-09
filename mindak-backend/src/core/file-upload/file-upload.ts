import { injectable } from 'inversify';
import { promises as fs } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

import type { IFileUpload } from './file-upload.interface';

@injectable()
export class FileUpload implements IFileUpload {
  private readonly uploadsDir: string;

  constructor() {
    // Use uploads directory at the root of the project
    this.uploadsDir = path.join(process.cwd(), 'uploads');
  }

  async saveFile(file: Buffer, filename: string, subfolder?: string): Promise<string> {
    // Ensure uploads directory exists
    const targetDir = subfolder
      ? path.join(this.uploadsDir, subfolder)
      : this.uploadsDir;

    await fs.mkdir(targetDir, { recursive: true });

    // Save the file
    const filePath = path.join(targetDir, filename);
    await fs.writeFile(filePath, file);

    // Return the URL path (relative to the uploads directory)
    const urlPath = subfolder
      ? `/uploads/${subfolder}/${filename}`
      : `/uploads/${filename}`;

    return urlPath;
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      // Remove leading slash and 'uploads/' from the path
      const relativePath = filePath.replace(/^\/uploads\//, '');
      const fullPath = path.join(this.uploadsDir, relativePath);

      await fs.unlink(fullPath);
    } catch (error) {
      // Ignore errors if file doesn't exist
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  generateUniqueFilename(originalFilename: string): string {
    const ext = path.extname(originalFilename);
    const timestamp = Date.now();
    const randomString = randomBytes(8).toString('hex');

    return `${timestamp}-${randomString}${ext}`;
  }
}
