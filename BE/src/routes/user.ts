import { Elysia, t } from "elysia";
import type { Context as ElysiaContext } from "elysia";
import { UserService } from "../services/user.service";
import { userSchema } from "../utils/validation";
// import { isAuthenticated, isAdmin } from "../middleware/auth";

type BaseContext = ElysiaContext & {
  user: User | null;
  set: Set;
};

type ProfileContext = BaseContext;

type PasswordContext = BaseContext & {
  body: PasswordBody;
};

type ListUsersContext = BaseContext & {
  query: Query;
};

type UserByIdContext = BaseContext & {
  params: { id: string };
};

type CreateUserContext = BaseContext & {
  body: CreateUserBody;
};

type UpdateUserContext = BaseContext & {
  params: { id: string };
  body: UpdateUserBody;
};

type DeleteUserContext = BaseContext & {
  params: { id: string };
};

type Handler<T> = (context: T) => Promise<ApiResponse>;

type User = {
  id: string;
  username: string;
  role: string;
};

type ErrorResponse = {
  message: string;
  error: true;
};

type SuccessResponse<T = any> = {
  message?: string;
  data?: T;
  error?: never;
};

type ApiResponse<T = any> = ErrorResponse | SuccessResponse<T>;

type Set = {
  status: number;
};

type Query = Record<string, string | null>;

type PasswordBody = {
  oldPassword: string;
  newPassword: string;
};

type CreateUserBody = {
  username: string;
  email: string;
  password: string;
  role: "admin" | "user";
};

type UpdateUserBody = Partial<CreateUserBody>;

export const userRouter = new Elysia({ prefix: "/users" })
  .get("/profile", async ({ jwt, headers: { authorization }, set }) => {
    const user = await jwt.verify(authorization);
    
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized", error: true };
    }

    try {
      return await UserService.findById(user.id);
    } catch (error) {
      set.status = 404;
      return {
        message:
          error instanceof Error ? error.message : "User tidak ditemukan",
        error: true,
      };
    }
  })
  .put(
    "/profile/password",
    async ({ jwt, headers: { authorization }, body, set }) => {
      const user = await jwt.verify(authorization);
      
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized", error: true };
      }

      try {
        if (!body.oldPassword || !body.newPassword) {
          set.status = 400;
          return {
            message: "Password lama dan baru harus diisi",
            error: true,
          };
        }

        await UserService.changePassword(
          user.id,
          body.oldPassword,
          body.newPassword
        );

        return {
          message: "Password berhasil diubah",
        };
      } catch (error) {
        set.status = 400;
        return {
          message:
            error instanceof Error ? error.message : "Gagal mengubah password",
          error: true,
        };
      }
    },
    {
      body: t.Object({
        oldPassword: t.String(),
        newPassword: t.String(),
      }),
    }
  )
  .get("/", async ({ jwt, headers: { authorization }, set, query }) => {
    const user = await jwt.verify(authorization);
    
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized", error: true };
    }
    
    const { search, role, page, limit } = query;
    return await UserService.findAll({
      search: search as string,
      role: role as string,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });
  })
  .get("/:id", async ({ jwt, headers: { authorization }, params: { id }, set }) => {
    const user = await jwt.verify(authorization);
    
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized", error: true };
    }
    try {
      return await UserService.findById(id);
    } catch (error) {
      set.status = 404;
      return {
        message:
          error instanceof Error ? error.message : "User tidak ditemukan",
        error: true,
      };
    }
  })
  .post(
    "/",
    async ({ jwt, headers: { authorization }, body, set }) => {
      const user = await jwt.verify(authorization);
      
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized", error: true };
      }
      try {
        const validatedData = userSchema.parse(body);
        const user = await UserService.create(validatedData);
        set.status = 201;
        return {
          message: "User berhasil dibuat",
          data: user,
        };
      } catch (error) {
        set.status = 400;
        return {
          message:
            error instanceof Error ? error.message : "Gagal membuat user",
          error: true,
        };
      }
    },
    {
      body: t.Object({
        username: t.String({ minLength: 3, maxLength: 50 }),
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 6 }),
        role: t.Enum({ admin: "admin", user: "user" }),
      }),
    }
  )
  .put(
    "/:id",
    async ({ jwt, headers: { authorization }, params: { id }, body, set }) => {
      const user = await jwt.verify(authorization);
      
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized", error: true };
      }
      try {
        const validatedData = userSchema.partial().parse(body);
        const user = await UserService.update(id, validatedData);
        return {
          message: "User berhasil diupdate",
          data: user,
        };
      } catch (error) {
        set.status =
          error instanceof Error && error.message.includes("tidak ditemukan")
            ? 404
            : 400;
        return {
          message:
            error instanceof Error ? error.message : "Gagal mengupdate user",
          error: true,
        };
      }
    },
    {
      body: t.Partial(
        t.Object({
          username: t.String({ minLength: 3, maxLength: 50 }),
          email: t.String({ format: "email" }),
          password: t.String({ minLength: 6 }),
          role: t.Enum({ admin: "admin", user: "user" }),
        })
      ),
    }
  )
  .delete("/:id", async ({ jwt, headers: { authorization }, params: { id }, set }) => {
    const user = await jwt.verify(authorization);
    
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized", error: true };
    }

    try {
      if (user?.id === id) {
        set.status = 400;
        return {
          message: "Tidak dapat menghapus akun sendiri",
          error: true,
        };
      }

      await UserService.delete(id);
      return {
        message: "User berhasil dihapus",
      };
    } catch (error) {
      set.status =
        error instanceof Error && error.message.includes("tidak ditemukan")
          ? 404
          : 400;
      return {
        message:
          error instanceof Error ? error.message : "Gagal menghapus user",
        error: true,
      };
    }
  });
