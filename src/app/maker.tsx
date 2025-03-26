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
  import { useState } from "react";
  import ReactCrop, { Crop } from "react-image-crop";
  
  export default function Maker() {
    const [url, setUrl] = useState(
      "https://www.tiktok.com/@funnyvideo_offlina/video/7330887021814107425?q=funny%20dog&t=1742896078195"
    );
    const [description, setDescription] = useState("");
    const [caption, setCaption] = useState("");
    const [thumbnail, setThumbnail] = useState("");
  
    const [crop, setCrop] = useState<Crop>({
      unit: "%",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });
  
    async function startImport() {
      const {
        data: { description, thumbnail },
      } = await axios.get("/file/import?url=" + url);
      setUrl("");
      setDescription(description);
      setCaption(description);
      setThumbnail(thumbnail);
      setCrop({
        unit: "%",
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      });
    }
  
    async function make() {
      await axios.post(`/file/make`, {
        crop,
        description,
        caption,
      });
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
          <Button onClick={startImport} disabled={!url}>
            Import
          </Button>
        </Group>
  
        {thumbnail && (
          <Stack>
            <Flex justify={'center'} style={{ opacity: 0.04}}>
              <ReactCrop
                crop={crop}
                onChange={(_crop, percentCrop) => setCrop(percentCrop)}
              >
                <Image src={thumbnail} style={{ width: 300 }} />
              </ReactCrop>
            </Flex>
  
            <Textarea
              placeholder="Description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
  
            <Textarea
              placeholder="Caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
  
            <Button onClick={make}>Make</Button>
          </Stack>
        )}
      </Box>
    );
  }
  