import path from "path";
import _ from 'lodash';
import YTDlpWrap from 'yt-dlp-wrap';
import ffmpeg from "fluent-ffmpeg";
import { NextApiHandler } from "next";
import axios from "axios";
import fs from 'fs';


function extractUrl(input: string) {
    const regex = /"url":"([^"]+)/;
    const match = regex.exec(input);

    if (match && match[1]) {
        return JSON.parse(`"${match[1]}"`);
    } else {
        return null;
    }
}

function extractDesc(input: string) {
    const regex = /"caption":"([^"]+)/;
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


    const headers = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8,fr-FR;q=0.7,fr;q=0.6',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
        'Cookie': 'kpf=PC_WEB; clientid=3; did=web_5b92606c2aee16f4a5632b488adf96bf; didv=1734623899000; kwpsecproductname=PCLive; kwfv1=GALIG9Qf8B0L7PAq0lwBP9G9QDG0HUGfLEPnb0+/LAweWUGA4jP0bSPBcF+0qUP0LUGADFG/DM+A8YP0SjGA+Dw/DEw/zD8/ZM+frlG0YSP/Qj+fHEPAq7+/rFw/WA+Arh8/mf+eY0P0DF+/HF+9rI+BHMPAWM+eWIGA8YPnrhw/c=; userId=3885181847; kuaishou.server.webday7_st=ChprdWFpc2hvdS5zZXJ2ZXIud2ViZGF5Ny5zdBKwAVeweNnCrjQCCGq4SZFeHy6z53hDW6JcyiCdLAWpiX-ibKJwuwSQR5rQ1JZ5UnCofDV7uD2G2eRe60IYv0SUZfIcC1gQZIT-tPxJKWob8ju0lz8ZXXRDl-2nDu75_1C_4-Qot1WO0KZ58KAnANOWubRv9HJ-Z5IsEFeIA3PoGZqrB2PzrF-ms1owxTjnhcymplb0_zYrP2vE2yAe4Kkxhf660B9Mi6937epjk58taXScGhKSiarCLStkfqMqbK__YwGl85IiIMXl6PUJmpfuoB275cWcwKdABKM7RP99Jrn7_ZICTcFUKAUwAQ; kuaishou.server.webday7_ph=679fc99aaed32f51d1f54c0a2d93fce48d62; kpn=KUAISHOU_VISION; did=web_5b92606c2aee16f4a5632b488adf96bf; clientid=3; kpf=PC_WEB; kpn=KUAISHOU_VISION',
        'Referer': 'https://www.google.com/',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
    };

    const { data } = await axios.get(url, {
        headers
    });

    const downloadUrl = extractUrl(data);
    const desc = extractDesc(data);
 
    const fileResponse = await axios.get(downloadUrl, {
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

    const now = Date.now();

    const outputPath = path.join(process.cwd(), 'public', 'temp', now + '.mp4');
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
                })}\n\n`, );
                res.end();
                resolve(null);
            });
        });

        fileResponse.data.pipe(writer);
    })
    res.end();
}

export default handler;