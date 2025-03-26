import axios from "axios";
import { NextApiHandler } from "next";
import path from "path";
import fs from 'fs';
import ffmpeg from "fluent-ffmpeg";
import _ from 'lodash';

function slugify(str: string) {
    str = str.toLowerCase();
    str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    str = str.replace(/[^a-z0-9]+/g, "-");
    str = str.replace(/^-+|-+$/g, "");
    return str;
}


async function makeVideo(videoPath: string, desc: string, avatar: string, {
    cropX, cropY, cropWidth, cropHeight, speed
}: any, onProgress?: (progress: {
    frames: number;
    currentFps: number;
    currentKbps: number;
    targetSize: number;
    timemark: string;
    percent?: number | undefined;
}) => void): Promise<string> {
    const now = Date.now();

    const width = 1080;
    const height = 1920;

    const cmd = ffmpeg();

    cmd.addInput(videoPath);

    const overlayPath = path.join(process.cwd(), 'public', 'overlay.mp4');
    cmd.addInput(overlayPath).addInputOption('-stream_loop -1');

    const avatarPath = path.join(process.cwd(), 'public', 'avatars', avatar);
    cmd.addInput(avatarPath);

    const outputPath = path.join(process.cwd(), 'public', 'temp', now + '-' + slugify(desc.trim()) + '.mp4');
    
    return new Promise((resolve, reject) => {
        cmd.on('end', () => {
            // resolve(outputPath);
            setTimeout(() => {
                fs.unlinkSync(videoPath);
            }, 2000);
            const newCmd = ffmpeg();
            newCmd.addInput(outputPath);
            const _speed = Number(speed) / 100;

            newCmd.videoFilter(`setpts=(1/${_speed.toFixed(2)})*PTS`)
                  .audioFilter(`atempo=${_speed},aecho=0.8:0.88:60:0.1`);
            newCmd.on('progress', function (pro) {
                onProgress && onProgress(pro);
            });
            newCmd.on('end', () => {
                setTimeout(() => {
                    fs.unlinkSync(outputPath);
                    // fs.unlinkSync(outputPath + '-final.mp4');
                }, 2000);
                resolve(outputPath + '-final.mp4');
            });
            newCmd.output(outputPath + '-final.mp4');
            newCmd.run();
        });
        cmd.on('error', (err) => {
            reject(err);
        })

        // cmd.on('start', function (commandLine) {
        //     console.log(commandLine); // In ra raw command
        // });

        cmd.on('progress', function (progress) {
            onProgress && onProgress(progress);
        });

        function removeEmojis(str: string) {
            return str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
        }

        const captionsArr = _.chunk(desc.split(' '), 4).map((chunk, idx) => {
            return removeEmojis(chunk.join(' ')).trim();
        });

        let textPosition = 0.75;
        if (avatar === 'transparent.png') {
            textPosition = 0.62;
        }
        const captions = captionsArr.map((line, idx) => {
            return `[output]drawtext=fontfile=./public/fonts/LeagueSpartan-Bold.ttf:text='${line}':x=(w-text_w)*0.5:y=(h-text_h)*${textPosition}+(${idx}*54):fontsize=48:fontcolor=white:shadowcolor=black:shadowx=2:shadowy=2[output]`
        })

        let cropCommand = `[0]crop=${Number(cropWidth) / 100 }*iw:${Number(cropHeight) / 100}*ih:${Number(cropX) / 100}*in_w:${Number(cropY) / 100}*in_h[origin]`;

        cmd.complexFilter([
            cropCommand,
            `[origin]scale=${width}:${Math.ceil(height * 0.55)},setsar=1:1[origin]`,
            `[origin]split[top][bottom]`,
            `[top]pad=iw:2*ih,vaguedenoiser,eq=brightness=-0.05:contrast=0.95:saturation=0.95,hqdn3d=4:3:6:4.5,deband,convolution,unsharp=23:3:1.8[top]`,
            `[bottom]boxblur=10,eq=brightness=-0.45:contrast=0.9:saturation=0.4[bottom]`,
            `[top][bottom]overlay=0:h[full]`,
            `[full]crop=${width}:${height}:0:0[full]`,
            `[full]scale=${width}:${height},setsar=1:1,format=gbrp[i1]`,
            `[1]scale=${width}:${height},setsar=1:1,format=gbrp[i2]`,
            `[i1][i2]blend=all_mode=screen:all_opacity=0.3[output]`,
            `[2]scale=-1:${height / 6.6},setsar=1:1[logo]`,
            `[output][logo]overlay=x=(W-w)/2:y=(H-h)*0.65[output]`,
            ...captions,
            `[output]pad=iw:ih+ih*0.15:(iw-iw)/2:(ih*0.15)/2:black`
        ])
            .addOutputOption('-shortest');

        cmd.output(outputPath);
        cmd.run();
    })
}

const handler: NextApiHandler = async (req, res) => {
    const { path, caption, avatar, cropX, cropY, cropWidth, cropHeight, speed } = req.query;
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Content-Encoding", "none");

    const filePath = await makeVideo(path as string, caption as string, avatar as string, {
        cropX, cropY, cropWidth, cropHeight, speed
    }, (progress) => {
        res.write(`event: update\ndata:${JSON.stringify(progress)}\n\n`);
    });
    res.write(`event: done\ndata:${filePath}\n\n`);
    res.end();
}

export default handler;