import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';

type AuthUser = {
  id: string;
  username: string;
  role: string;
};

declare module 'elysia' {
  interface ElysiaContext {
    user: AuthUser | null;
  }
}

export const authMiddleware = new Elysia()
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET!,
  }))
  .derive(({ jwt, cookie, headers }) => {
    return {
      getUser: async () => {
        const token = cookie?.auth?.toString() || headers.authorization?.split(' ')[1];
        if (!token) return null;

        try {
          const user = await jwt.verify(token) as AuthUser;
          return user;
        } catch {
          return null;
        }
      },
    };
  })
  .derive(async (context) => {
    const user = await context.getUser();
    return { user };
  });

export const isAuthenticated = new Elysia()
  .use(authMiddleware)
  .derive(async ({ user, set }) => {
    if (!user) {
      set.status = 401;
      throw new Error('Unauthorized');
    }
    return {};
  });

export const isAdmin = new Elysia()
  .use(isAuthenticated)
  .derive(async ({ user, set }) => {
    if (user?.role !== 'admin') {
      set.status = 403;
      throw new Error('Forbidden');
    }
    return {};
  });