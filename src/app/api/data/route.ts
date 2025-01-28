import type { NextRequest } from "next/server";

import type { AIGuardResult, PangeaResponse } from "@src/types";

import {
  auditLogRequest,
  getUrl,
  postRequest,
  validateToken,
} from "../requests";

const SERVICE_NAME = "ai-guard";
const API_VERSION = "v1beta";

export async function POST(request: NextRequest) {
  const { success: authenticated, username } = await validateToken(request);

  if (!(authenticated && username)) {
    return new Response("Forbidden", { status: 403 });
  }

  const body: any = await request.json();

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
        event_input: body.text,
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
