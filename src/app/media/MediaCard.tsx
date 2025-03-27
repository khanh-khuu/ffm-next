import {
  ActionIcon,
  AspectRatio,
  Box,
  Card,
  CloseButton,
  Group,
  Image,
  LoadingOverlay,
  Text,
} from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { useState } from "react";

export default function MediaCard({
  file,
  onDelete,
}: {
  file: string;
  onDelete: (fileName: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  function download() {
    window.open(`/media/${file}?download`);
  }

  async function deleteImage() {
    setLoading(true);
    await onDelete(file);
    setLoading(false);
  }

  return (
    <Card bg="#242424" pos="relative">
      <Card.Section>
        <LoadingOverlay visible={loading} color="white" />
        <AspectRatio ratio={1.3}>
          {file.endsWith("mp4") ? (
            <video controls src={`/media/${file}`} />
          ) : (
            <Image src={`/media/${file}`} />
          )}
        </AspectRatio>
      </Card.Section>
      <Card.Section>
        <Group wrap="nowrap" justify="space-between" p="xs">
          <Text fw="lighter">{file.slice(0, 19)}</Text>
          <Group gap="0" justify="right">
            <ActionIcon
              variant="subtle"
              color="dimmed"
              size="lg"
              onClick={download}
            >
              <IconDownload size="20px" />
            </ActionIcon>
            <CloseButton disabled={loading} size="lg" onClick={deleteImage} />
          </Group>
        </Group>
      </Card.Section>
    </Card>
  );
}
