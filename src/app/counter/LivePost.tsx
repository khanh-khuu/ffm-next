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
  Box,
  Anchor,
} from "@mantine/core";
import {
  IconHeart,
  IconHeartBolt,
  IconHeartFilled,
  IconMessage,
  IconMessageFilled,
  IconShare,
} from "@tabler/icons-react";
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
    try {
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
    } catch (err) {
      getLatestVideo();
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
    <Card bg="rgb(30, 29, 29)" py="10px">
      <Stack gap="0">
        <Text>{data.username}</Text>
        <Anchor
          underline={"never"}
          target="_blank"
          fz="xs"
          href={`https://www.tiktok.com/@${data.id}`}
        >
          <Text style={{ color: "#484848" }} fz="xs">
            {data.id}
          </Text>
        </Anchor>
      </Stack>

      <CloseButton
        pos="absolute"
        right={"1em"}
        top={"1em"}
        onClick={() => onDelete(data)}
      />

      <Card.Section bg="grey">
        <Box h="65px" pos="relative">
          <Overlay color="#000" backgroundOpacity={0.76} zIndex={1}>
            <Flex
              w="100%"
              h="80%"
              justify={"center"}
              align={"center"}
            >
              {loading ? (
                <Loader />
              ) : (
                <Anchor
                  fz="2.3em"
                  c="#e3e3e3"
                  fw="bolder"
                  underline={"never"}
                  target="_blank"
                  href={`https://www.tiktok.com/@${data.id}/video/${post.id}`}
                >
                  <SlotCounter
                    sequentialAnimationMode
                    useMonospaceWidth
                    value={new Intl.NumberFormat().format(
                      post.statistics.viewCount
                    )}
                    duration={2}
                  />
                </Anchor>
              )}
            </Flex>
          </Overlay>
        </Box>
      </Card.Section>
      <Group justify="space-between" style={{ color: "#484848" }}>
        <Group gap="4px" justify="center" align="center">
          <IconHeartFilled size="13px" />
          <Text fz="13px" pb="2px">
            {Number(post.statistics.likeCount.toFixed(1)).toFixed()}
          </Text>
        </Group>
        <Group gap="4px" justify="center" align="center" fz="h4">
          <IconMessageFilled size="13px" />
          <Text fz="13px" pb="2px">
            {Number(post.statistics.commentCount.toFixed(1)).toFixed()}
          </Text>
        </Group>
        <Group gap="4px" justify="center" align="center" fz="h4">
          <IconShare size="13px" />
          <Text fz="13px" pb="2px">
            {Number(post.statistics.shareCount.toFixed(1)).toFixed()}
          </Text>
        </Group>
      </Group>
    </Card>
  );
}
