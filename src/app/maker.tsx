"use client";

import {
  Box,
  Button,
  Flex,
  Group,
  Image,
  SegmentedControl,
  Select,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core";
import axios from "axios";
import { useRef, useState } from "react";
import ReactCrop, { Crop } from "react-image-crop";
import { VideoThumbnailGenerator } from "browser-video-thumbnail-generator";
import removeHashTag from "@/helper/removeHashTag";
import removeEmojis from "@/helper/removeEmoji";

export default function Maker({ avatars }: { avatars: string[] }) {
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [caption, setCaption] = useState("");
  const [avatar, setAvatar] = useState("transparent.png");
  const [thumbnail, setThumbnail] = useState("");
  const generator = useRef<VideoThumbnailGenerator | null>(null);
  const [loading, setLoading] = useState(false);

  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });

  function rezoneCrop(width: number, height: number) {
    let x = 0;
    let y = 0;
    let w = 100;
    let h = 100;

    if (width < height) {
      h = ((width * 1.2) / height) * 100;
      if (h > 100) h = 100;
      y = (100 - h) / 2;
    }

    if (width >= height) {
      w = ((height * 1.2) / width) * 100;
      if (w > 100) w = 100;
      x = (100 - w) / 2;
    }

    setCrop({
      unit: "%",
      x,
      y,
      width: w,
      height: h,
    });
  }

  async function startImport() {
    generator.current?.revokeUrls();
    setLoading(true);
    const {
      data: { description, file },
    } = await axios.get("/file/import?url=" + url);

    setUrl("");
    setDescription(description);
    setCaption(removeEmojis(removeHashTag(description)).trim());

    generator.current = new VideoThumbnailGenerator(file);
    try {
      const thumbnail = await generator.current?.getThumbnail();
      setThumbnail(thumbnail?.thumbnail || "");
      if (thumbnail) {
        rezoneCrop(thumbnail.width, thumbnail.height);
      }
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  }

  async function make() {
    setLoading(true);
    await axios.post(`/file/make`, {
      crop,
      description,
      caption,
      avatar,
    });
    setLoading(false);
    setCrop({
      unit: "%",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });
    setDescription("");
    setCaption("");
    setThumbnail("");
    setAvatar("transparent.png");
  }

  return (
    <Box>
      <Group>
        <TextInput
          flex={1}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button onClick={startImport} disabled={!url} loading={loading}>
          Import
        </Button>
      </Group>

      {thumbnail && (
        <Stack mt="xl">
          <Flex justify={"center"}>
            <ReactCrop
              crop={crop}
              onChange={(_crop, percentCrop) => setCrop(percentCrop)}
            >
              <Image src={thumbnail} style={{ width: 300 }} />
            </ReactCrop>
          </Flex>

          <Textarea
            label="Description"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Textarea
            label="Caption on video"
            placeholder="Caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />

          <SegmentedControl
            data={avatars.map((x) => ({
              value: x,
              label: (
                <Flex justify={"center"} align={"center"}>
                  <Image w={60} src={"/avatars/" + x} />
                </Flex>
              ),
            }))}
            value={avatar}
            onChange={(val) => setAvatar(val)}
          />

          <Button onClick={make} loading={loading} disabled={loading}>
            Make
          </Button>
        </Stack>
      )}
    </Box>
  );
}
