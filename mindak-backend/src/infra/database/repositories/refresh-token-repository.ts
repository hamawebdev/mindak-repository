import { inject, injectable } from 'inversify';
import { eq, and, lt } from 'drizzle-orm';

import type { IDatabase } from '@/infra/database/database';
import { SERVICES_DI_TYPES } from '@/container/services/di-types';
import { refreshTokenTable, type RefreshTokenEntity } from '@/infra/database/schemas/refresh-token';
import type { IRefreshTokenRepository, RefreshToken } from '@/domain/repositories/refresh-token-repository.interface';

@injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(
    @inject(SERVICES_DI_TYPES.Database) private readonly database: IDatabase,
  ) {}

  async create(refreshToken: RefreshToken): Promise<RefreshToken> {
    const db = this.database.getInstance();

    const [result] = await db.insert(refreshTokenTable).values({
      id: refreshToken.id,
      userId: refreshToken.userId,
      token: refreshToken.token,
      expiresAt: refreshToken.expiresAt,
      isRevoked: refreshToken.isRevoked,
      createdAt: refreshToken.createdAt,
      revokedAt: refreshToken.revokedAt,
    }).returning();

    return this.toRefreshToken(result);
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const db = this.database.getInstance();

    const result = await db.query.refreshTokenTable.findFirst({
      where: eq(refreshTokenTable.token, token),
    });

    if (!result) {
      return null;
    }

    return this.toRefreshToken(result);
  }

  async revokeToken(tokenId: string): Promise<void> {
    const db = this.database.getInstance();

    await db.update(refreshTokenTable)
      .set({
        isRevoked: true,
        revokedAt: new Date(),
      })
      .where(eq(refreshTokenTable.id, tokenId));
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    const db = this.database.getInstance();

    await db.update(refreshTokenTable)
      .set({
        isRevoked: true,
        revokedAt: new Date(),
      })
      .where(
        and(
          eq(refreshTokenTable.userId, userId),
          eq(refreshTokenTable.isRevoked, false)
        )
      );
  }

  async deleteExpiredTokens(): Promise<void> {
    const db = this.database.getInstance();

    await db.delete(refreshTokenTable)
      .where(lt(refreshTokenTable.expiresAt, new Date()));
  }

  private toRefreshToken(entity: RefreshTokenEntity): RefreshToken {
    return {
      id: entity.id,
      userId: entity.userId,
      token: entity.token,
      expiresAt: entity.expiresAt,
      isRevoked: entity.isRevoked,
      createdAt: entity.createdAt,
      revokedAt: entity.revokedAt,
    };
  }
}

