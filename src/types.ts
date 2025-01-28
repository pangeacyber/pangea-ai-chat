import type { MessageFieldWithRole } from "@langchain/core/messages";

export interface PangeaResponse<T = unknown> {
  request_id: string;
  request_time: string;
  response_time: string;
  status: string;
  summary: string;
  result: T;
}

export interface AIGuardDetector<T> {
  detected: boolean;
  data: T | null;
}

export interface AIGuardResult {
  detectors: {
    prompt_injection: AIGuardDetector<{
      analyzer_responses: { analyzer: string; confidence: number }[];
    }>;
    pii_entity?: AIGuardDetector<{
      entities: { redacted: boolean }[];
    }>;
    malicious_entity?: AIGuardDetector<{
      entities: unknown[];
    }>;
  };
  prompt_text: string;
  prompt_messages: MessageFieldWithRole[];
}
