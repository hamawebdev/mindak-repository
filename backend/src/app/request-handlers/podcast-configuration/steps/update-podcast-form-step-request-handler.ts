import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { UpdatePodcastFormStepUseCaseFailure, UpdatePodcastFormStepUseCasePayload, UpdatePodcastFormStepUseCaseSuccess } from '@/domain/use-cases/podcast-configuration/steps/update-podcast-form-step-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  data: unknown;
  error?: unknown;
};

@injectable()
export class UpdatePodcastFormStepRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.UpdatePodcastFormStepUseCase) private readonly updatePodcastFormStepUseCase: IUseCase<UpdatePodcastFormStepUseCasePayload, UpdatePodcastFormStepUseCaseSuccess, UpdatePodcastFormStepUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const { id } = req.params;
    const input = req.body;

    const result = await this.updatePodcastFormStepUseCase.execute({ id, input });

    if (result.isSuccess()) {
      res.status(200).send({
        success: true,
        data: result.value.step,
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
