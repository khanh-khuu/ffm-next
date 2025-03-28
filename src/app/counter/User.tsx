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
    <Card
      onClick={() => onClick(data.id)}
      w={110}
      bg="dark"
      style={{ cursor: "pointer" }}
    >
      <Group justify="center" align="center" fz="1em">
        {data.username}
      </Group>
      <Group justify="center" align="center" c="dimmed" fz=".8em">
        {data.id}
      </Group>
    </Card>
  );
}
