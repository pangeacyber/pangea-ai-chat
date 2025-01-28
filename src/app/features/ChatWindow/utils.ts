import type { MessageFieldWithRole } from "@langchain/core/messages";

import {
  aiProxyRequest,
  auditProxyRequest,
  dataGuardProxyRequest,
  docsProxyRequest,
  promptGuardProxyRequest,
} from "@src/app/proxy";

export const fetchDocuments = async (
  token: string,
  userPrompt: string,
  authz = false,
) => {
  return await docsProxyRequest(token, { userPrompt, authz });
};

export const generateCompletions = async (
  token: string,
  messages: MessageFieldWithRole[],
  systemPrompt: string,
  userPrompt: string,
) => {
  return await aiProxyRequest(token, {
    input: messages,
    systemPrompt,
    userPrompt,
  });
};

export const callPromptGuard = async (
  token: string,
  userPrompt: string,
  systemPrompt: string,
) => {
  const messages = [
    {
      content: userPrompt,
      role: "user",
    },
  ];

  if (!!systemPrompt) {
    messages.push({ content: systemPrompt, role: "system" });
  }

  return await promptGuardProxyRequest(token, { messages });
};

export const callInputDataGuard = async (
  token: string,
  messages: readonly MessageFieldWithRole[],
) => {
  const payload = {
    recipe: "pangea_llm_prompt_guard",
    messages,
  };

  return await dataGuardProxyRequest(token, payload);
};

export const callResponseDataGuard = async (
  token: string,
  llmResponse: string,
) => {
  const payload = {
    recipe: "pangea_llm_response_guard",
    text: llmResponse,
  };

  return await dataGuardProxyRequest(token, payload);
};

export const auditUserPrompt = async (
  token: string,
  data: any,
): Promise<any> => {
  return await auditProxyRequest(token, "log", data);
};

export const auditPromptResponse = async (
  token: string,
  data: any,
): Promise<any> => {
  return await auditProxyRequest(token, "log", data);
};

export const auditSearch = async (token: string, data: any): Promise<any> => {
  return await auditProxyRequest(token, "search", data);
};
