'use client'

import {
    Box,
    Button,
    Flex,
    Group,
    Image,
    Stack,
    Textarea,
    TextInput,
  } from "@mantine/core";
  import axios from "axios";
  import { useRef, useState } from "react";
  import ReactCrop, { Crop } from "react-image-crop";
  import {VideoThumbnailGenerator} from "browser-video-thumbnail-generator";
import removeHashTag from "@/helper/removeHashTag";
import removeEmojis from "@/helper/removeEmoji";
  
  export default function Maker() {
    const [url, setUrl] = useState(
      "https://www.tiktok.com/@funnyvideo_offlina/video/7330887021814107425?q=funny%20dog&t=1742896078195"
    );
    const [description, setDescription] = useState("");
    const [caption, setCaption] = useState("");
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
      const thumbnail = await generator.current?.getThumbnail()
      setThumbnail(thumbnail?.thumbnail || '');
      setLoading(false);
      setCrop({
        unit: "%",
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      });
    }
  
    async function make() {
      setLoading(true);
      await axios.post(`/file/make`, {
        crop,
        description,
        caption,
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
            <Flex justify={'center'}>
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
  
            <Button onClick={make} loading={loading} disabled={loading}>Make</Button>
          </Stack>
        )}
      </Box>
    );
  }
  