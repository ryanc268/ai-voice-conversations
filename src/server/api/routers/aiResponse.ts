import { z } from "zod";
import { ChatGPTAPI } from "chatgpt";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { type GPTConvo } from "~/utils/interfaces";

const API = new ChatGPTAPI({
  apiKey: process.env.OPENAI_API_KEY as string,
});

export const aiResponseRouter = createTRPCRouter({
  respond: publicProcedure
    .input(
      z.object({
        text: z.string().min(1),
        parentId: z.string(),
        convoId: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      return fetchResponse(input);
    }),
});

const fetchResponse = async (input: GPTConvo): Promise<GPTConvo> => {
  const res = await API.sendMessage(input.text, {
    timeoutMs: 20000,
    conversationId: input.convoId,
    parentMessageId: input.parentId,
  });
  console.log("Input Received:", input);
  console.log("Output Returned:", res.text);
  return { text: res.text, parentId: res.id, convoId: res.conversationId };
};
