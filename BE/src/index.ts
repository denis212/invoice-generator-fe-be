import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { jwt } from "@elysiajs/jwt";
import { cookie } from "@elysiajs/cookie";

// Import routes
import { authRouter } from "./routes/auth";

// Import middleware
import { authMiddleware } from "./middleware/auth";
import { userRouter } from "./routes/user";
import { customerRouter } from "./routes/customer";
import { productRouter } from "./routes/product";
import { invoiceRouter } from "./routes/invoice";
import { businessProfileRouter } from "./routes/business-profile";

const app = new Elysia()
  .use(cors())
  .use(
    swagger({
      documentation: {
        info: {
          title: "Invoice Generator API",
          version: "1.0.0",
        },
      },
    })
  )
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET!,
    })
  )
  .use(cookie())
  // Public routes
  .get("/", () => "Invoice Generator API is running!")
  .use(authRouter)

  // Protected routes
  .use(authMiddleware)
  .use(userRouter)
  .use(customerRouter)
  .use(productRouter)
  .use(invoiceRouter)
  .use(businessProfileRouter)
  .listen({
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    hostname: "0.0.0.0",
  });

console.log(
  `🦊 Server is running at ${app.server?.hostname}:${app.server?.port}`
);
