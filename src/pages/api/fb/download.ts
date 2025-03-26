import path from "path";
import _ from 'lodash';
import fs from 'fs';
import ffmpeg from "fluent-ffmpeg";
import { NextApiHandler } from "next";
import { getFbVideoInfo } from "fb-downloader-scrapper";
import axios from "axios";
import he from 'he';

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

    const info = await getFbVideoInfo(url);

    const fileResponse = await axios.get(info.hd, {
        responseType: 'stream',
        headers: {
            'Content-Type': 'video/mp4',
        }
    });

    const totalLength = fileResponse.headers['Content-Length'] || fileResponse.headers['content-length'];

    let downloadedLength = 0;
    fileResponse.data.on('data', (chunk: any) => {
        downloadedLength += chunk.length;
        const progress = (downloadedLength / Number(totalLength) * 100);
        res.write(`event: update\ndata:${progress.toFixed(2)}\n\n`);
    });

    const now = Date.now().toString();

    const outputPath = path.join(process.cwd(), 'public', 'temp', now + '.mp4');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    const writer = fs.createWriteStream(outputPath);
    await new Promise(resolve => {
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
                        desc:  he.decode(info.title),
                        cover: `/api/file/${now + '.png'}`
                    })}\n\n`);
                    res.end();
                    resolve(null);
                });
        });

        fileResponse.data.pipe(writer);
    });
    res.end();
}

export default handler;