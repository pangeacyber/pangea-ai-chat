import { FC } from "react";
import { Stack } from "@mui/material";
import { ViewSidebarOutlined } from "@mui/icons-material";

import { Colors } from "@app/theme";

interface Props {
  handleClick: () => void;
}

const RightSideBar: FC<Props> = ({ handleClick }) => {
  return (
    <Stack
      width="60px"
      onClick={handleClick}
      alignItems="center"
      justifyContent="space-between"
      sx={{
        margin: "20px 20px 20px 0px",
        padding: "16px 0",
        background: Colors.background.paper,
        borderRadius: "10px",
        cursor: "pointer",
      }}
    >
      <Stack gap={2.5} alignItems="center">
        <ViewSidebarOutlined />
      </Stack>
    </Stack>
  );
};

export default RightSideBar;
