import { createTRPCRouter } from "~/server/api/trpc";
import { aiResponseRouter } from "./routers/aiResponse";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  response: aiResponseRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
