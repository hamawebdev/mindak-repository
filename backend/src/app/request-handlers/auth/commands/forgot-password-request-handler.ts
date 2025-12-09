import { inject, injectable } from 'inversify';
import { z } from 'zod';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { ForgotPasswordUseCaseFailure, ForgotPasswordUseCasePayload, ForgotPasswordUseCaseSuccess } from '@/domain/use-cases/auth/forgot-password-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  message: string;
};

const payloadSchema = z.object({
  email: z.string().email(),
});

/**
 * Forgot Password Request Handler
 *
 * Generates a password reset token and sends it to the user's email.
 *
 * Note: In production, this should:
 * 1. Send an email with the reset link (not return the token in response)
 * 2. Use a proper email service (SendGrid, AWS SES, etc.)
 * 3. Include rate limiting to prevent abuse
 *
 * For now, we return success without exposing the token for security.
 */
@injectable()
export class ForgotPasswordRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.ForgotPasswordUseCase) private readonly forgotPasswordUseCase: IUseCase<ForgotPasswordUseCasePayload, ForgotPasswordUseCaseSuccess, ForgotPasswordUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const { email } = payloadSchema.parse(req.body);

    const result = await this.forgotPasswordUseCase.execute({ email });

    if (result.isSuccess()) {
      // TODO: Send email with reset link
      // const { resetToken, email } = result.value;
      // await emailService.sendPasswordResetEmail(email, resetToken);

      // Always return success even if user not found (security best practice)
      const response: ResponseBody = {
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      };

      res.status(200).send(response);
      return;
    } else if (result.isFailure()) {
      const failure = result.failure;

      switch (failure.reason) {
        case 'UserNotFound':
          // Return success to prevent email enumeration
          const response: ResponseBody = {
            success: true,
            message: 'If the email exists, a password reset link has been sent',
          };
          res.status(200).send(response);
          return;
        case 'UnknownError':
          throw failure.error;
      }
    }
  }
}

