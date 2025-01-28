import type { NextRequest } from "next/server";
import { ChatBedrockConverse } from "@langchain/aws";
import type { MessageFieldWithRole } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";

import {
  auditLogRequest,
  auditSearchRequest,
  validateToken,
} from "../requests";
import { rateLimitQuery } from "@src/utils";
import { DAILY_MAX_MESSAGES, PROMPT_MAX_CHARS } from "@src/const";

const TEMP = 0.5;
const MAX_TOKENS = 512;

const llm = new ChatBedrockConverse({
  model: process.env.PANGEA_AI_MODEL!,
  region: process.env.PANGEA_AI_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  temperature: TEMP,
  maxTokens: MAX_TOKENS,
});
const chain = llm.pipe(new StringOutputParser());

export interface RequestBody {
  input: MessageFieldWithRole[];

  /** System prompt. */
  systemPrompt?: string;

  /** User's prompt. */
  userPrompt: string;
}

export async function POST(request: NextRequest) {
  const { success, username, profile } = await validateToken(request);

  if (!(success && username)) {
    return new Response("Forbidden", { status: 403 });
  }

  const body: RequestBody = await request.json();
  const systemPrompt = body.systemPrompt || "";

  if (body.userPrompt.length + systemPrompt.length > PROMPT_MAX_CHARS) {
    return new Response(`{"error": "Maximum prompt size exceeded"}`, {
      status: 400,
    });
  }

  const limitSearch = rateLimitQuery();
  limitSearch.search_restriction = { actor: [username] };
  const result = await auditSearchRequest(limitSearch);

  if (result?.error || (result?.count || 0) >= DAILY_MAX_MESSAGES) {
    return new Response(`{"error": "Daily limit exceeded"}`, {
      status: 400,
    });
  }

  try {
    const text = await chain.invoke(body.input);

    const auditLogData = {
      event: {
        event_input: body.userPrompt,
        event_output: text,
        event_type: "llm_response",
        event_context: JSON.stringify({
          system_prompt: systemPrompt,
        }),
        actor: username,
      },
    };

    await auditLogRequest(auditLogData);

    return Response.json({ content: text });
  } catch (err) {
    console.log("Error:", err);
    return new Response(`{"error": "ConverseCommand failed"}`, {
      status: 400,
    });
  }
}
