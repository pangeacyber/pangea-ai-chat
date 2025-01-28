import type { NextRequest } from "next/server";
import type { MessageFieldWithRole } from "@langchain/core/messages";

import type { AIGuardResult, PangeaResponse } from "@src/types";

import {
  auditLogRequest,
  getUrl,
  postRequest,
  validateToken,
} from "../requests";

const SERVICE_NAME = "ai-guard";
const API_VERSION = "v1beta";

export type RequestBody = (
  | {
      /**
       * Structured data to be scanned by AI Guard for PII, sensitive data,
       * malicious content, and other data types defined by the configuration.
       * Supports processing up to 10KB of text.
       */
      messages: readonly MessageFieldWithRole[];
    }
  | {
      /**
       * Text to be scanned by AI Guard for PII, sensitive data, malicious content,
       * and other data types defined by the configuration. Supports processing up
       * to 10KB of text.
       */
      text: string;
    }
) & {
  /**
   * Recipe key of a configuration of data types and settings defined in the
   * Pangea User Console. It specifies the rules that are to be applied to the
   * text, such as defang malicious URLs.
   */
  recipe?: string;
};

export async function POST(request: NextRequest) {
  const { success: authenticated, username } = await validateToken(request);

  if (!(authenticated && username)) {
    return new Response("Forbidden", { status: 403 });
  }

  const body: RequestBody = await request.json();

  const endpoint = `${API_VERSION}/text/guard`;
  const url = getUrl(SERVICE_NAME, endpoint);

  const {
    success,
    response,
  }: { success: boolean; response: PangeaResponse<AIGuardResult> } =
    await postRequest(url, body);

  if (success) {
    const auditLogData = {
      event: {
        event_input: JSON.stringify(
          "messages" in body ? body.messages : body.text,
        ),
        event_output: JSON.stringify(response.result.prompt_text),
        event_type: "ai_guard",
        event_context: JSON.stringify({
          recipe: body.recipe,
        }),
        event_findings: JSON.stringify(response.result.detectors),
        malicious_entity_count:
          response.result.detectors.malicious_entity?.data?.entities?.length ||
          0,
        actor: username,
      },
    };

    try {
      await auditLogRequest(auditLogData);
    } catch (_) {}

    return Response.json(response);
  } else {
    return Response.json(response, { status: 400 });
  }
}
