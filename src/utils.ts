import type { DocumentInterface } from "@langchain/core/documents";
import type { MessageFieldWithRole } from "@langchain/core/messages";
import type { Profile } from "@pangeacyber/react-auth";

export const delay = (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

export const rateLimitQuery = () => {
  const dt = new Date();
  const today = "24hour";

  const limitSearch = {
    query: "event_type:llm_response",
    limit: 1,
    start: today,
    search_restriction: {},
  };

  return limitSearch;
};

export const constructLlmInput = ({
  systemPrompt,
  userPrompt,
  documents,
  profile,
}: {
  systemPrompt: string;
  userPrompt: string;
  documents: readonly DocumentInterface[];
  profile: Profile;
}): MessageFieldWithRole[] => {
  const context = documents.length
    ? `\n${documents
        .map(({ pageContent }) => pageContent)
        .join("\n\n")}`
    : "";

  return [
    {
      role: "system",
      content: `${systemPrompt}`,
    },
    {
      role: "user",
      content: "Context: " + `${context}` + "\n Prompt: " + userPrompt,
    },
  ];
};
