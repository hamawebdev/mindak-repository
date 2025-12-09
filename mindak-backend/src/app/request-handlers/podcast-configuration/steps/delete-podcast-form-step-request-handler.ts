import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { DeletePodcastFormStepUseCaseFailure, DeletePodcastFormStepUseCasePayload, DeletePodcastFormStepUseCaseSuccess } from '@/domain/use-cases/podcast-configuration/steps/delete-podcast-form-step-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  message?: string;
  error?: unknown;
};

@injectable()
export class DeletePodcastFormStepRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.DeletePodcastFormStepUseCase) private readonly deletePodcastFormStepUseCase: IUseCase<DeletePodcastFormStepUseCasePayload, DeletePodcastFormStepUseCaseSuccess, DeletePodcastFormStepUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const { id } = req.params;

    const result = await this.deletePodcastFormStepUseCase.execute({ id });

    if (result.isSuccess()) {
      res.status(200).send({
        success: true,
        message: 'Step deleted successfully',
      });
    } else {
      const failure = result.failure;
      if (failure?.reason === 'StepNotFound') {
        throw HttpError.notFound('Step not found');
      }
      throw failure?.error || new Error('Unknown error');
    }
  }
}
