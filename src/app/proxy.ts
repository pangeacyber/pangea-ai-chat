import type { DocumentInterface } from "@langchain/core/documents";
import type { AuthZ } from "pangea-node-sdk";

import type { RequestBody as AiRequestBody } from "@src/app/api/ai/route";
import type { RequestBody as AiGuardRequestBody } from "@src/app/api/data/route";
import type { RequestBody as DocsRequestBody } from "@src/app/api/docs/route";
import type { RequestBody as UnredactRequestBody } from "@src/app/api/unredact/route";
import type { AIGuardResult, PangeaResponse, UnredactResult } from "@src/types";

export const docsProxyRequest = async (
  token: string,
  body: DocsRequestBody,
): Promise<{
  authzResponses: PangeaResponse<AuthZ.CheckResult>[];
  documents: DocumentInterface[];
}> => {
  return baseProxyRequest(token, "docs", "", body);
};

export const aiGuardProxyRequest = async (
  token: string,
  body: AiGuardRequestBody,
): Promise<PangeaResponse<AIGuardResult>> => {
  return baseProxyRequest(token, "data", "", body);
};

export const unredactProxyRequest = async (
  token: string,
  body: UnredactRequestBody,
): Promise<PangeaResponse<UnredactResult>> => {
  return baseProxyRequest(token, "unredact", "", body);
};

export const auditProxyRequest = async (
  token: string,
  action: string,
  body: any,
): Promise<Response> => {
  return baseProxyRequest(token, "audit", action, body);
};

export const aiProxyRequest = async (
  token: string,
  body: AiRequestBody,
): Promise<{ content: string }> => {
  return baseProxyRequest(token, "ai", "", body);
};

const baseProxyRequest = async <T = unknown>(
  token: string,
  service: string,
  action: string,
  body: unknown,
): Promise<T> => {
  const args = !!action ? `?action=${action}` : "";
  const resp = await fetch(`/api/${service}${args}`, {
    method: "POST",
    body: JSON.stringify(body),
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (resp.status > 299 || resp.status < 200) {
    const text = await resp.text();
    console.error(`Error: ${text}; while performing ${service}/${action}`);
    throw resp;
  }

  return await resp.json();
};
