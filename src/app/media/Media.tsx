"use client";

import { Box, Card, Group, SimpleGrid, Text } from "@mantine/core";
import {
  Dropzone,
  FileWithPath,
  IMAGE_MIME_TYPE,
  MIME_TYPES,
} from "@mantine/dropzone";
import { IconUpload, IconVideo, IconX } from "@tabler/icons-react";
import MediaCard from "./MediaCard";
import { useEffect, useState } from "react";
import axios from "axios";
import getListMedia from "./_actions/getListMedia";
import { uploadMedia } from "./_actions/uploadMedia";
import deleteMedia from "./_actions/deleteMedia";

export default function Media() {
  const [media, setMedia] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function onDrop(files: FileWithPath[]) {
    setLoading(true);
    for (const file of files) {
      // const formData = new FormData();
      // formData.set("file", file);
      // await axios.postForm(`/media/upload`, formData);
      await uploadMedia(file);
      await listMedia();
    }
    setLoading(false);
  }

  async function onDeleteMedia(file: string) {
    await deleteMedia(file);
    await listMedia();
  }

  async function listMedia() {
    const medias = await getListMedia();
    // const { data } = await axios.get<string[]>("/media/list");
    setMedia(medias);
  }

  useEffect(() => {
    listMedia();
  }, []);

  return (
    <Card>
      <Dropzone
        disabled={loading}
        loading={loading}
        accept={[...IMAGE_MIME_TYPE, MIME_TYPES.mp4]}
        onDrop={onDrop}
      >
        <Group
          justify="center"
          gap="xl"
          mih={220}
          style={{ pointerEvents: "none" }}
        >
          <Dropzone.Accept>
            <IconUpload
              size={52}
              color="var(--mantine-color-blue-6)"
              stroke={1.5}
            />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5} />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconVideo
              size={52}
              color="var(--mantine-color-dimmed)"
              stroke={1.5}
            />
          </Dropzone.Idle>

          <div>
            <Text size="xl" inline>
              Drag images/videos here or click to select files
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              Attach as many files as you like
            </Text>
          </div>
        </Group>
      </Dropzone>

      {media.length > 0 && (
        <SimpleGrid
          mt="66px"
          cols={{
            lg: 4,
            md: 3,
            sm: 3,
            xs: 2,
          }}
        >
          {media.map((x) => (
            <MediaCard key={x} file={x} onDelete={onDeleteMedia} />
          ))}
        </SimpleGrid>
      )}
    </Card>
  );
}
