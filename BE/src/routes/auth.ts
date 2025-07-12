import { Elysia, t } from "elysia";
import { AuthService } from "../services/auth.service";
import { loginSchema, userSchema } from "../utils/validation";

export const authRouter = new Elysia({ prefix: "/auth" })
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
  .post("/login", async ({ body, jwt, set }) => {
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
  .post("/logout", () => {
    return {
      message: "Logout berhasil",
    };
  })
  .get("/setup-check", async () => {
    try {
      const hasAdmin = await AuthService.hasAdminUser();
      return {
        setupRequired: !hasAdmin,
      };
    } catch (error) {
      return {
        setupRequired: true,
      };
    }
  });
