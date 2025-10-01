"use client";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { AuthProvider } from "@pangeacyber/react-auth";

import Layout from "./features/Layout";
import PangeaDark from "./theme";
import { ChatProvider } from "./context";

const LOGIN_URL = process.env.NEXT_PUBLIC_AUTHN_UI_URL || "";
const CLIENT_TOKEN = process.env.NEXT_PUBLIC_PANGEA_CLIENT_TOKEN || "";
const PANGEA_DOMAIN = process.env.NEXT_PUBLIC_PANGEA_BASE_DOMAIN || "";

export default function Home() {
  return (
    <AuthProvider
      config={{
        domain: PANGEA_DOMAIN,
        clientToken: CLIENT_TOKEN,
      }}
      cookieOptions={{
        useCookie: true,
      }}
      // onLogin={handleLogin}
      loginUrl={LOGIN_URL}
      useStrictStateCheck={false}
    >
      <AppRouterCacheProvider options={{ enableCssLayer: true }}>
        <ThemeProvider theme={PangeaDark()}>
          <CssBaseline />
          <ChatProvider>
            <Layout />
          </ChatProvider>
        </ThemeProvider>
      </AppRouterCacheProvider>
    </AuthProvider>
  );
}
