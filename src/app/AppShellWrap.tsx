"use client";

import { AppShell, Button, Flex, Group } from "@mantine/core";
import { IconBrandTelegram, IconEye, IconLiveView, IconWand } from "@tabler/icons-react";
import Link from "next/link";
import { PropsWithChildren } from "react";

export default function AppShellWrap({ children }: PropsWithChildren) {
  return (
    <AppShell
      header={{
        height: 60,
      }}
    >
      <AppShell.Header>
        <Group justify="center" align="center" h="60" gap="xs">
          <Link href={"/"}><Button variant="subtle" leftSection={<IconWand />}>Studio</Button></Link>
          <Link href={"/media"}><Button variant="subtle" leftSection={<IconBrandTelegram />}>Media</Button></Link>
          <Link href={"/counter"}><Button variant="subtle" leftSection={<IconEye />}>Counter</Button></Link>
        </Group>
      </AppShell.Header>
      <AppShell.Main pt="50px">{children}</AppShell.Main>
    </AppShell>
  );
}
