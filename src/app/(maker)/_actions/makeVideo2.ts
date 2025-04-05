// Zoompan

// #!/bin/bash
// input=input.mp4
// output=output.mp4

// width=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of default=noprint_wrappers=1:nokey=1 $input)
// height=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of default=noprint_wrappers=1:nokey=1 $input)

// ffmpeg -y -i $input -vf "scale=iw*1.5:ih*1.75, \
//   rotate=0.4 * (1 + sin(n/100))*PI/180, \
//   crop=$width:$height:(in_w-out_w)/2 + 0.35 * (1 + sin(n/100))*(in_w-out_w)/2:(in_h-out_h)/2 + 0.16 * (1 + cos(n/57))*(in_h-out_h)/2, \
//   eq=brightness=0.05:contrast=1.03:saturation=1.05, \
//   hqdn3d=4.0:3.0:6.0:4.5,unsharp=5:5:1.0:5:5:0.0" $output

"use server";

import axios from "axios";
import _ from "lodash";
import { Crop } from "react-image-crop";
import generateGithubName from "@/helper/generateGithubName";
import removeEmojis from "@/helper/removeEmoji";
import removeHashTag from "@/helper/removeHashTag";
import { BASE_URL, GITHUB_ENDPOINT } from "@/constant";
import Ffmpeg from "fluent-ffmpeg";

interface MakeVideoPayload {
    crop: Crop;
    description: string;
    caption: string;
    avatar: string;
    speed: string;
}

export default async function makeVideo2(payload: MakeVideoPayload) {
    const { crop, description, caption, avatar, speed } = payload;

    const caps = removeEmojis(removeHashTag(caption)).trim();
    const githubName = generateGithubName(description);

    const vid_url = `${BASE_URL}/file/input.mp4`;

    const { height, width } = await new Promise<{
        height: number;
        width: number;
    }>((resolve, reject) => {
        Ffmpeg.ffprobe('/tmp/input.mp4', function (err, data) {
            const { height, width } = data.streams.find(x => x.height && x.width)!;
            if (err) {
                reject(err);
            } else resolve({ height: height!, width: width! });
        })
    });

    const captionsArr = _.chunk(caps.split(" "), 4).map((chunk, idx) => {
        return removeEmojis(chunk.join(" ")).trim();
    });

    const fontSize = 54;

    let textPosition = 0.75;

    const captions = captionsArr.map((line, idx) => {
        return `[output]drawtext=fontfile=/lib/LeagueSpartan-Bold.ttf:text='${line}':x=(w-text_w)*0.5:y=(h-text_h)*${textPosition}+(${idx}*58):fontsize=${fontSize}:fontcolor=white:shadowcolor=black:shadowx=2:shadowy=2[output]`;
    });

    let cmd = `ffmpeg -i input.mp4 -i ./public/avatars/${avatar} -filter_complex "`;
    cmd += [
        `[0]scale=${width}*1.5:${height}*1.75[scaled]`,
        '[scaled]rotate=0.4 * (1 + sin(n/100))*PI/180[rotated]',
        `[rotated]crop=${width}:${height}:(in_w-out_w)/2 + 0.4 * (1 + sin(n/100))*(in_w-out_w)/2:(in_h-out_h)/2 + 0.2 * (1 + cos(n/57))*(in_h-out_h)/2[cropped]`,
        '[cropped]eq=brightness=0.05:contrast=1.03:saturation=1.05[eq]',
        '[eq]hqdn3d=4.0:3.0:6.0:4.5,unsharp=5:5:1.0:5:5:0.0[output]',
        ...captions,
        `[output]pad=iw:ih+ih*0.15:(iw-iw)/2:(ih*0.15)/2:black[output]`,
        `[output]setpts=PTS/${speed}[video]`,
        `[0:a]atempo=${speed}[audio]`,
    ].join(";");

    cmd += `" -map "[video]" -map "[audio]" -shortest output.mp4`;

    if (!process.env.GITHUB_TOKEN) throw new Error("Github Token is missing.");

    const {
        data: { workflows },
    } = await axios.get(`${GITHUB_ENDPOINT}/actions/workflows`, {
        headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
    });

    if (workflows.length === 0) throw new Error("Workflow not found.");

    const endpoint = `${GITHUB_ENDPOINT}/actions/workflows/${workflows[0].id}/dispatches`;
    try {
        await axios.post(
            endpoint,
            {
                ref: "main",
                inputs: {
                    vid_url,
                    cmd,
                    description: githubName,
                },
            },
            {
                headers: {
                    Accept: "application/vnd.github+json",
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                },
            }
        );
        return true;
    } catch (err: any) {
        throw new Error(err.response.data);
    }
}
