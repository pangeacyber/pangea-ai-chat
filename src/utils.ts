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
    query: "type:llm_response",
    limit: 1,
    start: today,
    search_restriction: {},
  };

  return limitSearch;
};

// Construct just the system prompt and "context messaages" separately from the user+assistant chat history
export const constructLlmSystemAndContextMessages = ({
  userPrompt,
  systemPrompt,
  documents,
  profile
}: {
  userPrompt: string;
  systemPrompt: string;
  documents: readonly DocumentInterface[];
  profile: Profile;
}): MessageFieldWithRole[] => {
  const context = documents.length
    ? `PTO balances:\n${documents
        .map(({ pageContent }) => pageContent)
        .join("\n\n")})`
    : "";

  const contextRequired = /\bPTO\b|time off|paid time off|paid vacation|vacation time/i.test(userPrompt);

  return [
    {
      role: "system",
      content: systemPrompt 
    },     
    {
      role: "user",
      content: `Extra context on who the user is in case it is needed, but ignore if it isn't relevant to the question: User's first name: ${profile.first_name} User's last name: ${profile.last_name}`
    },
    ...(contextRequired ? [{ role: "user", content: `Extra context in case it is needed, but ignore if it isn't relevant to the question: ${context}`}] : [])    
  ];
};

// Construct the user + assistant chat history seprately from the system prompt and "context messages"
export const constructLlmChatHistoryMessages = ({
  chatPrompt,
  chatHistory
}: {
  chatPrompt: MessageFieldWithRole;
  chatHistory: MessageFieldWithRole[];
}): MessageFieldWithRole[] => {
  return [
    ...chatHistory,
    chatPrompt,    
  ];
};


// Construct the full lllm input by combining the system prompt, context messages, and chat history
export const constructLlmInput = ({
  systemAndContextMessages,
  chatHistoryMessages
}: {
  systemAndContextMessages: MessageFieldWithRole[];
  chatHistoryMessages: MessageFieldWithRole[];
}): MessageFieldWithRole[] => {
  return [
    ...systemAndContextMessages,
    ...chatHistoryMessages
  ];
};