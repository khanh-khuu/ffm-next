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

    // const overlayPath = path.join(process.cwd(), 'public', 'overlay.mp4');
    // cmd.addInput(overlayPath).addInputOption('-stream_loop -1');

    // const avatarPath = path.join(process.cwd(), 'public', 'avatars', avatar);
    // cmd.addInput(avatarPath);

    const outputPath = path.join(process.cwd(), 'public', 'temp', now + '-' + slugify(desc.trim()) + '.mp4');
    
    return new Promise((resolve, reject) => {
        cmd.on('end', () => {
            resolve(outputPath);
            // setTimeout(() => {
            //     fs.unlinkSync(videoPath);
            // }, 2000);
            // const newCmd = ffmpeg();
            // newCmd.addInput(outputPath);
            // const _speed = Number(speed) / 100;

            // newCmd.videoFilter(`setpts=(1/${_speed.toFixed(2)})*PTS`)
            //       .audioFilter(`atempo=${_speed},aecho=0.8:0.88:60:0.1`);
            // newCmd.on('progress', function (pro) {
            //     onProgress && onProgress(pro);
            // });
            // newCmd.on('end', () => {
            //     setTimeout(() => {
            //         fs.unlinkSync(outputPath);
            //     }, 2000);
            //     resolve(outputPath + '-final.mp4');
            // });
            // newCmd.output(outputPath + '-final.mp4');
            // newCmd.run();
        });
        cmd.on('error', (err) => {
            reject(err);
        })

        cmd.on('start', function (commandLine) {
            console.log(commandLine); // In ra raw command
        });

        cmd.on('progress', function (progress) {
            onProgress && onProgress(progress);
        });


        cmd.complexFilter([
            `[0:v]split=2[v1][v2]`,
            `[v2]reverse,boxblur=10[cropped]`,
            `[cropped]crop=6:6:(iw-6)/2:(ih-6)/2[crop]`,
            `[v1][crop]overlay=(W-6)/2:(H-6)/2`
        ]);
        
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