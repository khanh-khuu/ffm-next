'use client'

import { ActionIcon, Box, Button, Card, CopyButton, Flex, Group, Image, NumberInput, Progress, Select, SelectProps, Slider, Stack, Textarea, TextInput } from "@mantine/core"
import { useEffect, useRef, useState } from "react";
import FileList from "./file-list";
import { nprogress } from "@mantine/nprogress";
import axios from "axios";
import _ from "lodash";
import { IconCheck, IconClipboard, IconCopy, IconCopyCheckFilled } from "@tabler/icons-react";
import ReactCrop, { type Crop } from 'react-image-crop'
import { useDebouncedValue } from "@mantine/hooks";

function checkSocialMediaLink(url: string) {
    // Regular expressions to match different social media URLs
    const facebookRegex = /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com)\/.+/i;
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i;
    const tiktokRegex = /^(https?:\/\/)?(www\.)?tiktok\.com\/.+/i;
    const kuaishouRegex = /^(https?:\/\/)?(www\.)?kuaishou\.com\/.+/i;

    if (facebookRegex.test(url)) {
        return 'fb';
    } else if (youtubeRegex.test(url)) {
        return 'yt';
    } else if (tiktokRegex.test(url)) {
        return 'tt';
    } else if (kuaishouRegex.test(url)) {
        return 'ks';
    } else {
        throw new Error('lỗi link không hỗ trợ');
    }
}

interface ProgressStdOut {
    frames: number;
    currentFps: number;
    currentKbps: number;
    targetSize: number;
    timemark: string;
    percent: number;
}

interface Props {
    avatars: string[]
}

export default function Home({ avatars }: Props) {
    const [text, setText] = useState<ProgressStdOut>({
        currentFps: 0,
        currentKbps: 0,
        frames: 0,
        percent: 0,
        targetSize: 0,
        timemark: '',
    });
    const [url, setUrl] = useState('');
    const [data, setData] = useState<{
        path: string;
        desc: string;
        cover: string;
    } | null>(null);

    const [debouncedCover] = useDebouncedValue(data?.cover, 300);

    const [downloadProgress, setDownloadProgress] = useState('');
    const [inProgress, setInProgress] = useState(false);
    const [avatar, setAvatar] = useState<string | null>('transparent.png');
    const [clipboard, setClipboard] = useState('');
    const coverRef = useRef(null);

    const [speed, setSpeed] = useState(94);

    const [crop, setCrop] = useState<Crop>({
        unit: '%',
        x: 0,
        y: 0,
        width: 100,
        height: 100
    });

    function calculateScore(a: number, b: number) {
        if (a === 0 || b === 0) {
           return 100;
        }
        const [max, min] = a > b ? [a, b] : [b, a];
        const ratio = max / min;
        if (ratio === 1) {
            return 100;
        } else if (ratio >= 2) {
            return 50;
        } else {
            return 50 + (50 / ratio);
        }
    }

    useEffect(() => {
        if (!debouncedCover) return;
        const { naturalWidth, naturalHeight } = (coverRef.current! as any);

        const ratio = calculateScore(naturalWidth, naturalHeight);

        const width = naturalHeight > naturalWidth ? 100 : ratio;
        const height = naturalHeight > naturalWidth ? ratio : 100;
        const x = (100 - width) / 2;
        const y = (100 - height) / 2;

        setCrop({
            unit: '%',
            x,
            y,
            width,
            height,
        });
    }, [debouncedCover]);

    useEffect(() => {
        (async function () {
            const { data } = await axios.get('/clipboard');
            setClipboard(data.text);
        })();
    }, []);

    async function sendtest() {
        await axios.post('/clipboard', {
            text: clipboard
        });
    }

    function removeEmojis(str: string) {
        return str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
    }

    async function download(_url?: string) {
        if (_url) setUrl(_url);
        const downloadUrl = url || _url || '';
        if (!downloadUrl) return;

        const provider = checkSocialMediaLink(downloadUrl);

        const source = new EventSource(`/api/${provider}/download?url=${downloadUrl}`);
        setDownloadProgress('Waiting...');
        source.addEventListener("update", (e) => {
            setDownloadProgress(e.data + '%...');
            console.log("update", e.data);
        });

        source.addEventListener('done', async (e) => {
            const { desc, path, cover } = JSON.parse(e.data);
            setData({
                path,
                desc: removeEmojis(desc.replace(/#\w+/g, '')).trim(),
                cover
            });
            setClipboard(desc);
            await axios.post('/clipboard', {
                text: desc
            });
            setDownloadProgress('');
            source.close();
        });
    }

    async function downloadFromClipboard() {
        const url = await navigator.clipboard.readText();
        setUrl(url);
        download(url);
    }

    function complete() {
        setInProgress(false);
        setUrl('');
        nprogress.complete();
        setData(null);
        setAvatar('transparent.png');
        const audio = document.getElementById("notificationSound");
        (audio! as HTMLAudioElement).play();
    }

    async function execute() {
        if (!data) return;
        if (!crop) return;
        if (!avatar) return;
        if (!speed) return;

        setInProgress(true);

        const source = new EventSource('/api/tt/make2?speed=' + speed + '&cropX=' + (crop.x).toFixed(1) + '&cropY=' + (crop.y).toFixed(1) + '&cropWidth=' + (crop.width).toFixed(1) + '&cropHeight=' + (crop.height).toFixed(1) + '&avatar=' + avatar + '&path=' + data.path + '&caption=' + data.desc);

        source.addEventListener('update', function (datalist) {
            const json: ProgressStdOut = JSON.parse(datalist.data);
            nprogress.set(json.percent);
            setText(json);
        });

        source.addEventListener('done', function (data) {
            const newFilePath = data.data;
            complete();
            source.close();

        });
    }

    const renderSelectOption: SelectProps['renderOption'] = ({ option, checked }) => (
        <Group flex="1" gap="xs">
            <Image src={'/avatars/' + option.value} w="30" />
            {option.label}
            {checked && <IconCheck style={{ marginInlineStart: 'auto' }} />}
        </Group>
    );


    return (
        <Card style={{ maxWidth: 500, marginLeft: 'auto', marginRight: 'auto', marginTop: '2em' }} radius={'lg'}>
            <audio id="notificationSound" src="/done.mp3"></audio>
            <Group>
                <TextInput placeholder="https://..." flex={1} value={url} onChange={(e) => setUrl(e.target.value)} />
                <ActionIcon onClick={downloadFromClipboard} variant="subtle" disabled={!!downloadProgress || inProgress}><IconClipboard /></ActionIcon>
                <Button onClick={() => download()} disabled={!!downloadProgress || inProgress} variant="light">{downloadProgress || 'Download'}</Button>
            </Group>

            <Textarea rightSection={<CopyButton value={clipboard}>
                {({ copied, copy }) => (<ActionIcon variant="subtle" onClick={copy}>
                    {copied ? <IconCopyCheckFilled /> : <IconCopy />}
                </ActionIcon>)}
            </CopyButton>} mt="xl" onBlur={sendtest} rows={3} value={clipboard} onChange={(e) => setClipboard(e.target.value)} />

            {data && <Stack py="xl">
                <Box ta="center" w="100%">
                    <Box maw={250} mx="auto">
                        <ReactCrop keepSelection disabled={inProgress} crop={crop} onChange={(_crop, percentCrop) => setCrop(percentCrop)}>
                            <Image src={data?.cover} ref={coverRef} />
                        </ReactCrop>
                    </Box>
                </Box>
                <Group>
                    <NumberInput label="Speed (Min 50 - Max 400)" min={50} max={400} value={speed} onChange={(val) => setSpeed(val as number)} />
                    <Select label="Avatar" searchable data={avatars} value={avatar} onChange={(val) => setAvatar(val)} renderOption={renderSelectOption} />
                </Group>
                <Group>
                    <Textarea label="Caption" flex={1} value={data.desc} onChange={(event) => setData({
                        desc: event.target.value,
                        path: data.path,
                        cover: data.cover
                    })} rows={4} />
                    {avatar && <Image src={'/avatars/' + avatar} height="100" />}
                </Group>
                <Button onClick={execute} disabled={inProgress || !!downloadProgress} variant="light">{inProgress ? text.timemark : 'Make video'}</Button>
                {inProgress && <Progress.Root size="xl">
                    <Progress.Section value={text.percent}>
                        <Progress.Label>{text.percent?.toFixed(1)}%</Progress.Label>
                    </Progress.Section>
                </Progress.Root>}
            </Stack>}
            <Box mt="sm">
                <FileList />
            </Box>
        </Card>
    )
}
