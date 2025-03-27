"use client";

import {
  AspectRatio,
  Box,
  Card,
  Flex,
  Group,
  Image,
  Overlay,
  Text,
} from "@mantine/core";
import { IconHeart, IconMessage, IconShare } from "@tabler/icons-react";
import SlotCounter from 'react-slot-counter';

export default function Post({ data }: { data: UserDatum }) {
  return (
    <Card bg="black">
      <Card.Section>
        <AspectRatio pos="relative">
          <Overlay color="#000" backgroundOpacity={0.9}>
            <Flex fz="3em" pos="absolute" w="100%" h="100%" justify={'center'} align={'center'}>
                <SlotCounter value={new Intl.NumberFormat().format(data.statistics.viewCount)} />
            </Flex>
          </Overlay>
          <Image src={data.dynamicCover} />
        </AspectRatio>
      </Card.Section>
      <Group justify="space-between">
        <Group c="dimmed" gap="0.5em" justify="center" align="center" fz="h4">{data.statistics.likeCount.toFixed()} <IconHeart size="22px" /></Group>
        <Group c="dimmed" gap="0.5em" justify="center" align="center" fz="h4">{data.statistics.commentCount.toFixed()} <IconMessage size="22px" /></Group>
        <Group c="dimmed" gap="0.5em" justify="center" align="center" fz="h4">{data.statistics.shareCount.toFixed()} <IconShare size="22px" /></Group>
      </Group>
    </Card>
  );
}
