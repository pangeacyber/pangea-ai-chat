import { FC } from "react";
import { IconButton, Stack, Typography } from "@mui/material";
import ViewSidebarOutlinedIcon from "@mui/icons-material/ViewSidebarOutlined";

import SecurityControls from "./components/SecurityControls";
import SystemPrompt from "./components/SystemPrompt";
import PangeaLogo from "@app/components/Logo";
import { Colors } from "@app/theme";
import LoginWidget from "@app/components/LoginWidget";
import PanelHeader from "@app/components/PanelHeader";

interface Props {
  open: boolean;
  onClose: () => void;
}

const SidePanel: FC<Props> = ({ onClose }) => {
  return (
    <Stack
      justifyContent="space-between"
      sx={{
        height: "100%",
        background: Colors.background.default,
      }}
    >
      <Stack ml="20px">
        <PanelHeader>
          <Stack direction="row" gap={1} p="24px 20px">
            <PangeaLogo />
            <Typography variant="h6">Pangea Chat</Typography>
          </Stack>
          <IconButton onClick={onClose}>
            <ViewSidebarOutlinedIcon sx={{ color: Colors.icons }} />
          </IconButton>
        </PanelHeader>
        <SecurityControls />
        <SystemPrompt />
      </Stack>
      <LoginWidget />
    </Stack>
  );
};

export default SidePanel;
