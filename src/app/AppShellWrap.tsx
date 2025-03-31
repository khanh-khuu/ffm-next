"use client";

import { AppShell, Button, Flex, Group } from "@mantine/core";
import { IconBrandTelegram, IconEye, IconLiveView, IconWand } from "@tabler/icons-react";
import Link from "next/link";
import { PropsWithChildren } from "react";
import { usePathname } from 'next/navigation'


export default function AppShellWrap({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <AppShell
      header={{
        height: 60,
      }}
    >
      <AppShell.Header>
        <Group justify="center" align="center" h="60" gap="xs">
          <Link href={"/"}><Button c={pathname === '/' ? '' : 'dimmed'} variant={pathname === '/' ? 'gradient' : 'transparent'} leftSection={<IconWand />}>Studio</Button></Link>
          <Link href={"/media"}><Button c={pathname === '/media' ? '' : 'dimmed'} variant={pathname === '/media' ? 'gradient' : 'transparent'} leftSection={<IconBrandTelegram />}>Media</Button></Link>
          <Link href={"/counter"}><Button c={pathname === '/counter' ? '' : 'dimmed'} variant={pathname === '/counter' ? 'gradient' : 'transparent'} leftSection={<IconEye />}>Counter</Button></Link>
        </Group>
      </AppShell.Header>
      <AppShell.Main pt="50px">{children}</AppShell.Main>
    </AppShell>
  );
}
