import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import { CORE_DI_TYPES } from '@/container/core/di-types';
import type { IFileUpload } from '@/core/file-upload/file-upload.interface';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  data: {
    image_url: string;
  };
};

@injectable()
export class UploadAnswerImageRequestHandler implements IRequestHandler<ResponseBody> {
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

    // Save file to uploads/question-answers directory
    const imageUrl = await this.fileUpload.saveFile(
      req.file.buffer,
      uniqueFilename,
      'question-answers'
    );

    const response: ResponseBody = {
      success: true,
      data: {
        image_url: imageUrl,
      },
    };

    res.status(200).send(response);
  }
}
