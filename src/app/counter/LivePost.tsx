"use client";

import {
  Text,
  AspectRatio,
  Card,
  Flex,
  Overlay,
  Image,
  Group,
  Stack,
  ActionIcon,
  CloseButton,
  Loader,
} from "@mantine/core";
import { IconHeart, IconMessage, IconShare } from "@tabler/icons-react";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import SlotCounter from "react-slot-counter";

export default function LivePost({
  data,
  onDelete,
}: {
  data: User;
  onDelete: (u: User) => void;
}) {
  const [post, setPost] = useState<UserDatum>({
    cover: "",
    dynamicCover: "",
    id: "",
    publishedAt: 0,
    statistics: {
      commentCount: 0,
      likeCount: 0,
      shareCount: 0,
      viewCount: 0,
    },
    title: "",
  });

  const [loading, setLoading] = useState(false);

  const timer = useRef<number>(null);

  async function getLatestVideo() {
    setLoading(true);
    const res = await axios.get<CounterViewResponse>(
      "/counter/views/" + data.userId
    );
    setLoading(false);

    setPost(res.data.userData[0]);
    if (res.data.userData[0]) {
      const latestPost = res.data.userData[0];
      setPost(latestPost);
    }
  }

  async function getStat() {
    if (!post) return;
    const { data } = await axios.get<Statistics>("/counter/view/" + post.id);
    setPost({
      ...post,
      statistics: data,
    });
  }

  useEffect(() => {
    timer.current = window.setInterval(() => {
      if (!post?.id) return;
      getStat();
    }, 2000);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [post?.id]);

  useEffect(() => {
    getLatestVideo();
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  return (
    <Card bg="black">
      <Stack gap="0">
        <Text>{data.username}</Text>
        <Text fz="xs">{data.id}</Text>
      </Stack>

      <CloseButton
        pos="absolute"
        right={"1em"}
        top={"1em"}
        onClick={() => onDelete(data)}
      />

      <Card.Section>
        <AspectRatio ratio={1.5} pos="relative">
          <Overlay color="#000" backgroundOpacity={0.9}>
            <Flex
              fz="3em"
              pos="absolute"
              w="100%"
              h="100%"
              justify={"center"}
              align={"center"}
            >
              {loading ? (
                <Loader />
              ) : (
                <SlotCounter
                  sequentialAnimationMode
                  useMonospaceWidth
                  value={new Intl.NumberFormat().format(
                    post.statistics.viewCount
                  )}
                />
              )}
            </Flex>
          </Overlay>
          <Image src={post.dynamicCover} />
        </AspectRatio>
      </Card.Section>
      <Group justify="space-between">
        <Stack c="dimmed" gap="0" justify="center" align="center" fz="h4">
          {Number(post.statistics.likeCount.toFixed(1)).toFixed()}{" "}
          <IconHeart size="22px" />
        </Stack>
        <Stack c="dimmed" gap="0" justify="center" align="center" fz="h4">
          {Number(post.statistics.commentCount.toFixed(1)).toFixed()}{" "}
          <IconMessage size="22px" />
        </Stack>
        <Stack c="dimmed" gap="0" justify="center" align="center" fz="h4">
          {Number(post.statistics.shareCount.toFixed(1)).toFixed()}{" "}
          <IconShare size="22px" />
        </Stack>
      </Group>
    </Card>
  );
}
