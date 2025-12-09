import type { User, UserId, UserRole } from '@/domain/models/user';

/**
 * This class is used to represent a user in the request context.
 */
export class RequestUser {
  id: UserId;
  username: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;

  constructor(params: {
    id: UserId;
    username: string;
    email: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = params.id;
    this.username = params.username;
    this.email = params.email;
    this.role = params.role;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  static fromUser(user: User): RequestUser {
    return new RequestUser({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}