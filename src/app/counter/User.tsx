"use client";

import { AspectRatio, Card, Group, Image } from "@mantine/core";

export default function UserCard({
  data,
  onClick,
}: {
  data: User;
  onClick: (username: string) => void;
}) {
  return (
    <Card onClick={() => onClick(data.username)} maw={90} bg="dark" style={{ cursor: 'pointer'}}>
      <AspectRatio ratio={1}>
        <Image src={data.avatar} radius={500} />
      </AspectRatio>
      <Group justify="center" align="center">
        <Group c="dimmed" fz=".8em">
          {data.username}
        </Group>
      </Group>
    </Card>
  );
}
