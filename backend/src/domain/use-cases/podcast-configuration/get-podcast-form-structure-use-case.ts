import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { PodcastFormStepRepository } from '@/domain/repositories/podcast-form-step-repository.interface';
import type { PodcastFormQuestionRepository } from '@/domain/repositories/podcast-form-question-repository.interface';
import type { PodcastFormStep } from '@/domain/models/podcast-form-step';
import type { PodcastFormQuestion } from '@/domain/models/podcast-form-question';

export type GetPodcastFormStructureUseCasePayload = {
  includeInactive?: boolean;
};

export type PodcastFormStepWithQuestions = PodcastFormStep & {
  questions: PodcastFormQuestion[];
};

export type GetPodcastFormStructureUseCaseSuccess = {
  steps: PodcastFormStepWithQuestions[];
  unassignedQuestions: PodcastFormQuestion[];
};

export type GetPodcastFormStructureUseCaseFailure = {
  reason: 'UnknownError';
  error: Error;
};

@injectable()
export class GetPodcastFormStructureUseCase implements IUseCase<GetPodcastFormStructureUseCasePayload, GetPodcastFormStructureUseCaseSuccess, GetPodcastFormStructureUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.PodcastFormStepRepository) private readonly podcastFormStepRepository: PodcastFormStepRepository,
    @inject(REPOSITORIES_DI_TYPES.PodcastFormQuestionRepository) private readonly podcastFormQuestionRepository: PodcastFormQuestionRepository,
  ) {}

  async execute(payload: GetPodcastFormStructureUseCasePayload) {
    try {
      const stepsPromise = payload.includeInactive
        ? this.podcastFormStepRepository.findAll()
        : this.podcastFormStepRepository.findAllActive();

      const questionsPromise = payload.includeInactive
        ? this.podcastFormQuestionRepository.findAll()
        : this.podcastFormQuestionRepository.findAllActive(); // Or findAllActiveWithOptions if we need options

      const [steps, questions] = await Promise.all([stepsPromise, questionsPromise]);

      // Map questions to steps
      const stepMap = new Map<string, PodcastFormQuestion[]>();
      const unassignedQuestions: PodcastFormQuestion[] = [];

      questions.forEach(q => {
        if (q.stepId) {
          if (!stepMap.has(q.stepId)) {
            stepMap.set(q.stepId, []);
          }
          stepMap.get(q.stepId)?.push(q);
        } else {
          unassignedQuestions.push(q);
        }
      });

      const stepsWithQuestions: PodcastFormStepWithQuestions[] = steps.map(step => ({
        ...step,
        questions: stepMap.get(step.id) || [],
      }));

      return new Success<GetPodcastFormStructureUseCaseSuccess>({
        steps: stepsWithQuestions,
        unassignedQuestions
      });
    } catch (error) {
      return new Failure<GetPodcastFormStructureUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}
