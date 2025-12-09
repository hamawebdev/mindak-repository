import { inject, injectable } from 'inversify';
import { eq, and, lt } from 'drizzle-orm';

import type { IDatabase } from '@/infra/database/database';
import { SERVICES_DI_TYPES } from '@/container/services/di-types';
import { passwordResetTokenTable, type PasswordResetTokenEntity } from '@/infra/database/schemas/password-reset-token';
import type { IPasswordResetTokenRepository, PasswordResetToken } from '@/domain/repositories/password-reset-token-repository.interface';

@injectable()
export class PasswordResetTokenRepository implements IPasswordResetTokenRepository {
  constructor(
    @inject(SERVICES_DI_TYPES.Database) private readonly database: IDatabase,
  ) {}

  async create(token: PasswordResetToken): Promise<PasswordResetToken> {
    const db = this.database.getInstance();

    const [result] = await db.insert(passwordResetTokenTable).values({
      id: token.id,
      userId: token.userId,
      token: token.token,
      expiresAt: token.expiresAt,
      isUsed: token.isUsed,
      createdAt: token.createdAt,
      usedAt: token.usedAt,
    }).returning();

    return this.toPasswordResetToken(result);
  }

  async findByToken(token: string): Promise<PasswordResetToken | null> {
    const db = this.database.getInstance();

    const result = await db.query.passwordResetTokenTable.findFirst({
      where: eq(passwordResetTokenTable.token, token),
    });

    if (!result) {
      return null;
    }

    return this.toPasswordResetToken(result);
  }

  async markAsUsed(tokenId: string): Promise<void> {
    const db = this.database.getInstance();

    await db.update(passwordResetTokenTable)
      .set({
        isUsed: true,
        usedAt: new Date(),
      })
      .where(eq(passwordResetTokenTable.id, tokenId));
  }

  async deleteExpiredTokens(): Promise<void> {
    const db = this.database.getInstance();

    await db.delete(passwordResetTokenTable)
      .where(lt(passwordResetTokenTable.expiresAt, new Date()));
  }

  async deleteUserTokens(userId: string): Promise<void> {
    const db = this.database.getInstance();

    await db.delete(passwordResetTokenTable)
      .where(eq(passwordResetTokenTable.userId, userId));
  }

  private toPasswordResetToken(entity: PasswordResetTokenEntity): PasswordResetToken {
    return {
      id: entity.id,
      userId: entity.userId,
      token: entity.token,
      expiresAt: entity.expiresAt,
      isUsed: entity.isUsed,
      createdAt: entity.createdAt,
      usedAt: entity.usedAt,
    };
  }
}

