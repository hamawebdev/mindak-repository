export type PasswordResetToken = {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
  usedAt?: Date | null;
};

export interface IPasswordResetTokenRepository {
  create(token: PasswordResetToken): Promise<PasswordResetToken>;
  findByToken(token: string): Promise<PasswordResetToken | null>;
  markAsUsed(tokenId: string): Promise<void>;
  deleteExpiredTokens(): Promise<void>;
  deleteUserTokens(userId: string): Promise<void>;
}

