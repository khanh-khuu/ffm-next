import path from "path";
import _ from 'lodash';
import YTDlpWrap from 'yt-dlp-wrap';
import ffmpeg from "fluent-ffmpeg";
import { NextApiHandler } from "next";

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

    const dlp = new YTDlpWrap(path.join(process.cwd(), 'lib', 'yt-dlp'));
    const now = Date.now().toString();
    const outputPath = path.join(process.cwd(), 'public', 'temp', now + '.mp4');

    await new Promise((resolve) => {
        dlp.exec([
            url,
            '-f',
            'best',
            '-o',
            outputPath,
        ])
            .on('progress', (progress) => {
                res.write(`event: update\ndata:${progress.percent?.toFixed(2)}\n\n`);
            })
            .on('close', async () => {
                const meta = await dlp.getVideoInfo(url);
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
                        desc: meta.title,
                        cover: `/api/file/${now + '.png'}`
                    })}\n\n`);
                    res.end();
                    resolve(null);
                });

            });
    });
    res.end();
}

export default handler;