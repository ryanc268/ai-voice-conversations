import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const aiResponseRouter = createTRPCRouter({
  respond: publicProcedure
    .input(z.object({ text: z.string().min(1) }))
    .query(({ input }) => {
      return {
        response: fetchResponse(input.text),
      };
    }),
});

const fetchResponse = (input: string) => {
  const aiMessage = "This is a test from the server!";
  console.log("Input Received:", input);
  return `AI Responded with: ${aiMessage}`;
};
