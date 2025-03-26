import axios from "axios";
import path from "path";
import fs from 'fs';
import _ from 'lodash';
import ffmpeg from 'fluent-ffmpeg';
import { NextApiHandler } from "next";

function extractUrl(input: string) {
    const regex = /playAddr":"([^"]+)/;
    const match = regex.exec(input);

    if (match && match[1]) {
        return JSON.parse(`"${match[1]}"`);
    } else {
        return null;
    }
}

function extractDesc(input: string) {
    const regex = /"desc":"([^"]+)/;
    const match = regex.exec(input);

    if (match && match[1]) {
        return JSON.parse(`"${match[1]}"`);
    } else {
        return null;
    }
}

const handler: NextApiHandler = async (req, res) => {
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Content-Encoding", "none");

    const url = req.query['url'] as string;

    if (!url || !url.toString().startsWith('https')) {
        return res.status(403).json({
            error: 'Url is invalid!'
        });
    }

    const response = await axios.get(url);
    const headers = response.headers;
    const downloadUrl = extractUrl(response.data);
    const desc = extractDesc(response.data);
    const cookies = headers['set-cookie']!;
    const cookie = cookies.map(x => x.split(';')[0]).join(';');

    const fileResponse = await axios.get(downloadUrl, {
        responseType: 'stream',
        headers: {
            'Content-Type': 'video/mp4',
            'Cookie': cookie,
        }
    });



    const totalLength = fileResponse.headers['Content-Length'] || fileResponse.headers['content-length'];

    let downloadedLength = 0;
    fileResponse.data.on('data', (chunk: any) => {
        downloadedLength += chunk.length;
        const progress = (downloadedLength / Number(totalLength) * 100);
        res.write(`event: update\ndata:${progress.toFixed(2)}\n\n`);
    });

    const now = Date.now();

    const outputPath = path.join(process.cwd(),  'public', 'temp', now + '.mp4');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    const writer = fs.createWriteStream(outputPath);
    await new Promise((resolve) => {
        writer.on('finish', () => {
            const cmd = ffmpeg();
                cmd.addInput(outputPath);
                cmd.screenshots({
                    count: 1,
                    folder: path.join(process.cwd(), 'public', 'temp'),
                    filename: now + '.png',
                    timemarks: ['0']
                });

                cmd.on('end', () => {
                    res.write(`event: done\ndata:${JSON.stringify({
                        path: outputPath,
                        desc,
                        cover: `/api/file/${now + '.png'}`
                    })}\n\n`);
                    res.end();
                    resolve(null);
                });
        });

        fileResponse.data.pipe(writer);
    })
    res.end();
};

export default handler;