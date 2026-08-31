import type { AuthUser } from '../../auth/interfaces/auth-user.interface';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
