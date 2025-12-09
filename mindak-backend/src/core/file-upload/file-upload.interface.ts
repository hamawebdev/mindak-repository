export interface IFileUpload {
  /**
   * Save an uploaded file to the uploads directory
   * @param file - The file buffer to save
   * @param filename - The filename to use
   * @param subfolder - Optional subfolder within uploads directory
   * @returns The relative URL path to access the file
   */
  saveFile(file: Buffer, filename: string, subfolder?: string): Promise<string>;

  /**
   * Delete a file from the uploads directory
   * @param filePath - The relative file path to delete
   */
  deleteFile(filePath: string): Promise<void>;

  /**
   * Generate a unique filename
   * @param originalFilename - The original filename
   * @returns A unique filename
   */
  generateUniqueFilename(originalFilename: string): string;
}
