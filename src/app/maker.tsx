"use client";

import {
  ActionIcon,
  Box,
  Button,
  FileButton,
  Flex,
  Group,
  Image,
  NumberInput,
  SegmentedControl,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core";
import axios from "axios";
import { useRef, useState } from "react";
import ReactCrop, { Crop } from "react-image-crop";
// import { VideoThumbnailGenerator } from "browser-video-thumbnail-generator";
import removeHashTag from "@/helper/removeHashTag";
import removeEmojis from "@/helper/removeEmoji";
import { IconUpload } from "@tabler/icons-react";

export default function Maker({ avatars }: { avatars: string[] }) {
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [caption, setCaption] = useState("");
  const [originalDuration, setOriginalDuration] = useState(0);
  const [duration, setDuration] = useState(0);
  const [avatar, setAvatar] = useState("transparent.png");
  const [thumbnail, setThumbnail] = useState("");
  // const generator = useRef<VideoThumbnailGenerator | null>(null);
  const [loading, setLoading] = useState(false);
  const thumbnailRef = useRef(null);

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

    if (w === 0 || h === 0) {
      x = 0;
      y = 0;
      w = 100;
      h = 100;
    }

    setCrop({
      unit: "%",
      x,
      y,
      width: w,
      height: h,
    });
  }

  function removeNonLatinKeepEmojiAndHashtags(text: string) {
    let cleanedText = text.replace(
      /[^\u0000-\u007F\u00A0-\u00FF\u0100-\u017F\u0180-\u024F\u0250-\u02AF\u1E00-\u1EFF\u2C60-\u2C7F\uA720-\uA7FF\u{1F300}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}#]/gu,
      ""
    );
    cleanedText = cleanedText.replace(/#(?![a-zA-Z0-9])/g, "");
    cleanedText = cleanedText.replace(/#+/g, "#");
    cleanedText = cleanedText.replace(/\s+/g, " ");
    return cleanedText;
  }

  async function uploadFile(file: File | null) {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    const {
      data: { description, thumbnail, duration, height, width },
    } = await axios.postForm("/file/upload", formData);
    setOriginalDuration(duration);
    setDuration(duration);
    setUrl("");
    setDescription(removeNonLatinKeepEmojiAndHashtags(description));
    setCaption(
      removeEmojis(
        removeHashTag(removeNonLatinKeepEmojiAndHashtags(description))
      ).trim()
    );

    try {
      setThumbnail(thumbnail);

      if (thumbnail) {
        rezoneCrop(width, height);
      }
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  }
  async function startImport() {
    // generator.current?.revokeUrls();
    setLoading(true);
    const {
      data: { description, thumbnail, duration, height, width },
    } = await axios.get("/file/import?url=" + url);
    setOriginalDuration(duration);
    setDuration(duration);
    setUrl("");
    setDescription(removeNonLatinKeepEmojiAndHashtags(description));
    setCaption(
      removeEmojis(
        removeHashTag(removeNonLatinKeepEmojiAndHashtags(description))
      ).trim()
    );

    try {
      // generator.current = new VideoThumbnailGenerator(file);
      // const thumbnail = await generator.current?.getThumbnail();
      // setThumbnail(thumbnail?.thumbnail || "");
      setThumbnail(thumbnail);

      if (thumbnail) {
        // const { naturalHeight, naturalWidth }  = thumbnailRef.current! as HTMLImageElement;
        rezoneCrop(width, height);
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
      speed: (originalDuration / duration).toFixed(1),
    });
    setLoading(false);
    setDuration(0);
    setOriginalDuration(0);
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
        <Button
          onClick={startImport}
          disabled={!url || !url.startsWith("https") || loading}
          loading={loading}
        >
          Import
        </Button>
        <FileButton onChange={(file) => uploadFile(file)} accept="video/mp4">
          {(props) => (
            <Button {...props} variant="subtle" loading={loading} disabled={loading}>
              <IconUpload />
            </Button>
          )}
        </FileButton>
      </Group>

      {thumbnail && (
        <Stack mt="xl">
          <Flex justify={"center"}>
            <ReactCrop
              crop={crop}
              onChange={(_crop, percentCrop) => setCrop(percentCrop)}
            >
              <Image
                ref={thumbnailRef}
                src={thumbnail}
                style={{ width: 300 }}
              />
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

          <NumberInput
            label={`New duration (original: ${originalDuration}s)`}
            placeholder="New Duration"
            value={duration}
            onChange={(val) => setDuration(Number(val))}
          />

          <Group justify={"flex-start"} align={"center"} gap={'1px'}>
            {avatars.map((x) => (<ActionIcon color="black" onClick={() => setAvatar(x)} style={{ opacity: avatar === x ? 1 : 1 }} variant={avatar === x ? 'filled' : 'light'} p="4px" w={60} h={60} key={x}><Image src={"/avatars/" + x} /></ActionIcon>))}
          </Group>
          
          <Button onClick={make} loading={loading} disabled={loading}>
            Make
          </Button>
        </Stack>
      )}
    </Box>
  );
}
