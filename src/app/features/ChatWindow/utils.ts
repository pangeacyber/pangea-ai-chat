import type { MessageFieldWithRole } from "@langchain/core/messages";

import {
  aiProxyRequest,
  auditProxyRequest,
  aiGuardProxyRequest,
  docsProxyRequest,
  unredactProxyRequest,
} from "@src/app/proxy";
import type { DetectorOverrides } from "@src/types";

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

export const callInputAIGuard = async (
  token: string,
  recipe: string,
  messages: readonly MessageFieldWithRole[],
  overrides?: DetectorOverrides,
) => {
  const payload = {
    recipe: recipe,
    messages,
    overrides,
  };

  return await aiGuardProxyRequest(token, payload);
};

export const callResponseAIGuard = async (
  token: string,
  recipe: string,
  llmResponse: string,
  overrides?: DetectorOverrides,
) => {
  const payload = {
    recipe: recipe,
    text: llmResponse,
    overrides,
  };

  return await aiGuardProxyRequest(token, payload);
};

export const unredact = async (
  token: string,
  redacted: string,
  fpe_context: string,
) => {
  const payload = {
    redacted_data: redacted,
    fpe_context,
  };

  return await unredactProxyRequest(token, payload);
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
