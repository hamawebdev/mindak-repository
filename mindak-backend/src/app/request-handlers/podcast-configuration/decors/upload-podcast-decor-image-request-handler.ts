import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import { CORE_DI_TYPES } from '@/container/core/di-types';
import type { IFileUpload } from '@/core/file-upload/file-upload.interface';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  data: {
    imageUrl: string;
  };
};

@injectable()
export class UploadPodcastDecorImageRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(CORE_DI_TYPES.FileUpload) private readonly fileUpload: IFileUpload,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    // Check if file was uploaded
    if (!req.file) {
      throw HttpError.badRequest('No file uploaded');
    }

    // Generate unique filename
    const uniqueFilename = this.fileUpload.generateUniqueFilename(req.file.originalname);

    // Save file to uploads/decors directory
    const imageUrl = await this.fileUpload.saveFile(
      req.file.buffer,
      uniqueFilename,
      'decors'
    );

    const response: ResponseBody = {
      success: true,
      data: {
        imageUrl,
      },
    };

    res.status(200).send(response);
  }
}
