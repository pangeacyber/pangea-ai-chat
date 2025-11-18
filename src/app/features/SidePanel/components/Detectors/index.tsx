import { Switch, Typography, Stack } from "@mui/material";

import { useChatContext } from "@src/app/context";

const Detectors = () => {
  const { aiGuardEnabled, setAiGuardEnabled } = useChatContext();

  return (
    <>
      <Typography variant="body2">
        AI Guard allows you to design recipes to protect against AI risks.
        Recipes are collections of detectors to block attacks, prevent
        disclosure, and avoid unwanted topics and content types.
      </Typography>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        gap={1}
        padding="10px 20px"
      >
        <Typography variant="body1">Apply AI Guard</Typography>
        <Switch
          color="secondary"
          checked={aiGuardEnabled}
          onChange={(_, checked) => setAiGuardEnabled(checked)}
          sx={{ marginRight: "-12px" }}
        />
      </Stack>
    </>
  );
};

export default Detectors;
