import { FC, useEffect, useMemo, useRef } from "react";
import { CircularProgress, Stack } from "@mui/material";

import { ChatMessage, useChatContext } from "@src/app/context";
import {
  UserPromptMessage,
  LlmResponse,
  AiGuardMessage,
} from "../ChatMessages";
import { useAuth } from "@pangeacyber/react-auth";
import { Colors } from "@src/app/theme";

interface Props {
  messages: ChatMessage[];
}

const ChatScroller: FC<Props> = ({ messages }) => {
  const { user } = useAuth();
  const { loading, auditPanelOpen } = useChatContext();
  const scollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scollRef.current && !loading) {
      scollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (scollRef.current && !loading) {
      scollRef.current.scrollIntoView();
    }
  }, [loading]);

  const messageContent = useMemo(() => {
    return (
      <Stack sx={{ width: "100%", maxWidth: "700px", margin: "0 auto" }}>
        {messages.map((message: ChatMessage, idx: number) => {
          switch (message.type) {
            case "llm_response":
              return (
                <LlmResponse
                  message={message.output}
                  key={`message-${message.hash}`}
                />
              );
            case "user_prompt":
              return (
                <UserPromptMessage
                  message={message.input || ""}
                  username={user?.username || "?"}
                  key={`message-${message.hash}`}
                />
              );
            case "data_guard":
            case "ai_guard":
              return (
                <AiGuardMessage
                  findings={message.findings || "{}"}
                  key={`message-${message.hash || idx}`}
                />
              );
            default:
              return null;
          }
        })}
        <div ref={scollRef}></div>
      </Stack>
    );
  }, [messages]);

  return (
    <Stack
      sx={{
        maxHeight: auditPanelOpen ? "60vh" : "calc(100vh - 260px)",
        overflow: "hidden",
        overflowY: "auto",
        padding: "0 20px",
      }}
    >
      {loading ? (
        <Stack width="100%" alignItems="center">
          <CircularProgress sx={{ color: Colors.secondary }} />
        </Stack>
      ) : (
        <>{messageContent}</>
      )}
    </Stack>
  );
};

export default ChatScroller;
