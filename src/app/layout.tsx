// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { ModalsProvider } from "@mantine/modals";
import "@mantine/nprogress/styles.css";
import "@mantine/dropzone/styles.css";
import "react-image-crop/dist/ReactCrop.css";

import { NavigationProgress } from "@mantine/nprogress";
import {
  AppShell,
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";

import { Notifications } from "@mantine/notifications";
import AppShellWrap from "./AppShellWrap";

export const metadata = {
  title: "K-G Next",
  description: "I have followed setup instructions carefully",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider defaultColorScheme="dark" forceColorScheme="dark">
          <Notifications />
          <NavigationProgress />
          <ModalsProvider>
            <AppShellWrap>{children}</AppShellWrap>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
