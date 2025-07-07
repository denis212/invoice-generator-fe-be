import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { cookie } from "@elysiajs/cookie";
import { AuthService } from "../services/auth.service";
import { loginSchema, userSchema } from "../utils/validation";

export const authRouter = new Elysia({ prefix: "/auth" })
  .use(jwt({
    name: "jwt",
    secret: process.env.JWT_SECRET!
  }))
  .use(cookie())
  .post("/register", async ({ body, set }) => {
    try {
      const validatedData = userSchema.parse(body);
      const user = await AuthService.register(
        validatedData.username,
        validatedData.email,
        validatedData.password,
        validatedData.role
      );
      return {
        message: "Registrasi berhasil",
        data: user,
      };
    } catch (error) {
      set.status = 400;
      return {
        message:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat registrasi",
        error: true,
      };
    }
  }, {
    body: t.Object({
      username: t.String(),
      email: t.String(),
      password: t.String(),
      role: t.String()
    })
  })
  .post("/login", async ({ body, jwt, setCookie, set }) => {
    try {
      const validatedData = loginSchema.parse(body);
      const user = await AuthService.login(
        validatedData.username,
        validatedData.password
      );

      const token = await jwt.sign({
        id: user.id,
        username: user.username,
        role: user.role,
      });

      setCookie("auth", token, {
        httpOnly: true,
        maxAge: 7 * 86400, // 7 days
        path: "/",
      });

      return {
        message: "Login berhasil",
        data: {
          user,
          token,
        },
      };
    } catch (error) {
      set.status = 401;
      return {
        message: error instanceof Error ? error.message : "Login gagal",
        error: true,
      };
    }
  }, {
    body: t.Object({
      username: t.String(),
      password: t.String()
    })
  })
  .post("/logout", ({ removeCookie }) => {
    removeCookie("auth");
    return {
      message: "Logout berhasil",
    };
  });
