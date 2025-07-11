import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { jwt } from "@elysiajs/jwt";

// Import routes
import { authRouter } from "./routes/auth";

// Import middleware
// import { isAuthenticated } from "./middleware/auth";
import { userRouter } from "./routes/user";
import { customerRouter } from "./routes/customer";
import { productRouter } from "./routes/product";
import { invoiceRouter } from "./routes/invoice";
import { businessProfileRouter } from "./routes/business-profile";

const app = new Elysia()
  .use(cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
  }))
  .options("*", () => {
    return new Response(null, { status: 200 });
  })
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
  // Public routes
  .get("/", () => "Invoice Generator API is running!")
  .use(authRouter)

  // Protected routes
  .use(userRouter)
  .use(customerRouter)
  .use(productRouter)
  .use(invoiceRouter)
  .use(businessProfileRouter)
  .listen({
    port: process.env.PORT ? parseInt(process.env.PORT) : 4209,
    hostname: "0.0.0.0",
  });

console.log(
  `🦊 Server is running at ${app.server?.hostname}:${app.server?.port}`
);
