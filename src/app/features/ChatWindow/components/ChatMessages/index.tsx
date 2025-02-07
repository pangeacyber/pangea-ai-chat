import { FC } from "react";
import { Avatar, Box, Stack, Typography } from "@mui/material";
import { ReviewsOutlined } from "@mui/icons-material";

import PangeaLogo from "@src/app/components/Logo";
import { Colors } from "@src/app/theme";
import type { AIGuardResult } from "@src/types";

interface UserPromptProps {
  message: string;
  username: string;
}

interface AiGuardProps {
  findings: string;
}

interface LlmMessageProps {
  message: string;
}

export const UserPromptMessage: FC<UserPromptProps> = ({
  message,
  username,
}) => {
  return (
    <Stack
      direction="row"
      gap={1}
      alignItems="center"
      justifyContent="flex-end"
      sx={{
        margin: "24px 0 24px 100px",
      }}
    >
      <Typography variant="body1">{message}</Typography>
      <Avatar
        sx={{
          width: 32,
          height: 32,
          fontSize: "14px",
          textTransform: "uppercase",
        }}
      >
        {username[0]}
      </Avatar>
    </Stack>
  );
};

export const LlmResponse: FC<LlmMessageProps> = ({ message }) => {
  return (
    <Stack
      direction="row"
      justifyContent="flex-start"
      gap={2}
      sx={{
        margin: "24px 100px 24px 0",
        pre: {
          margin: "0",
          fontFamily: "inherit",
          fontSize: "14px",
          lineHeight: "18px",
          whiteSpace: "break-spaces",
        },
      }}
    >
      <Box width="32px">
        <PangeaLogo size={32} />
      </Box>
      <Stack justifyContent="center">
        <pre>{message}</pre>
      </Stack>
    </Stack>
  );
};

export const AiGuardMessage: FC<AiGuardProps> = ({ findings }) => {
  const findingsJSON: AIGuardResult["detectors"] = JSON.parse(findings);

  const malicious = findingsJSON?.malicious_entity?.data?.entities?.length || 0;
  const injection =
    findingsJSON?.prompt_injection?.data?.analyzer_responses?.length || 0;
  const redacted =
    findingsJSON?.pii_entity?.data?.entities?.filter(
      (entity) => entity.action === "redacted",
    ).length || 0;
  const secrets = findingsJSON?.secrets_detection?.data?.entities?.length || 0;
  const language = findingsJSON?.language_detection?.data?.language;
  const code = findingsJSON?.code_detection?.data?.language;

  let result = "Findings: ";
  let addPipe = false;

  if (injection) {
    addPipe = true;
    result += `Prompt injection`;
  }

  if (redacted) {
    if (addPipe) result += " | ";
    result += `${redacted} ${redacted > 1 ? "entities" : "entity"} detected`;
    addPipe = true;
  }

  if (malicious) {
    if (addPipe) result += " | ";
    result += `${malicious} malicious item${malicious > 1 ? "s" : ""}`;
    addPipe = true;
  }

  if (secrets) {
    if (addPipe) result += " | ";
    result += `${secrets} secret${secrets > 1 ? "s" : ""}`;
    addPipe = true;
  }

  if (language) {
    if (addPipe) result += " | ";
    result += "Language";
    addPipe = true;
  }

  if (code) {
    if (addPipe) result += " | ";
    result += "Programming language";
    addPipe = true;
  }

  if (!(redacted || injection || malicious || secrets)) {
    result += "None";
  }

  return (
    <Stack
      direction="row"
      gap={1}
      alignItems="center"
      justifyContent="flex-start"
      sx={{
        marginBottom: "2px",
        padding: "12px 20px",
        borderRadius: "10px",
        background: Colors.card,
      }}
    >
      <ReviewsOutlined sx={{ color: Colors.secondary }} />
      <Typography
        variant="body1"
        sx={{ fontSize: "14px", whiteSpace: "nowrap" }}
      >
        AI Guard
      </Typography>
      <Typography variant="body2">{result}</Typography>
    </Stack>
  );
};
