import axios from "axios";
import _ from "lodash";
import { Crop } from "react-image-crop";
import generateGithubName from "@/helper/generateGithubName";
import removeEmojis from "@/helper/removeEmoji";
import removeHashTag from "@/helper/removeHashTag";
import { GITHUB_ENDPOINT } from "@/constant";

export async function POST(request: Request) {
  const {
    crop,
    description,
    caption,
    avatar,
  }: {
    crop: Crop;
    description: string;
    caption: string;
    avatar: string;
  } = await request.json();

  const caps = removeEmojis(removeHashTag(caption)).trim();
  const githubName = generateGithubName(description);

  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  const vid_url = `${baseUrl}/file/input.mp4`;
  const width = 1080;
  const height = 1920;

  const captionsArr = _.chunk(caps.split(" "), 4).map((chunk, idx) => {
    return removeEmojis(chunk.join(" ")).trim();
  });

  let logoPosition = 0.62;
  let textPosition = 0.76;

  if (avatar === "transparent.png") {
    logoPosition = 0.62;
    textPosition = 0.62;
  }

  const captions = captionsArr.map((line, idx) => {
    return `[output]drawtext=fontfile=/lib/LeagueSpartan-Bold.ttf:text='${line}':x=(w-text_w)*0.5:y=(h-text_h)*${textPosition}+(${idx}*54):fontsize=48:fontcolor=white:shadowcolor=black:shadowx=2:shadowy=2[output]`;
  });

  let cmd = `ffmpeg -i input.mp4 -i ./public/avatars/${avatar} -filter_complex "`;
  cmd += [
    `[0]crop=${Number(crop.width) / 100}*iw:${Number(crop.height) / 100}*ih:${
      Number(crop.x) / 100
    }*in_w:${Number(crop.y) / 100}*in_h[origin]`,
    `[origin]scale=${width}:${Math.ceil(height * 0.55)},setsar=1:1[origin]`,
    `[origin]split[top][bottom]`,
    // `[top]pad=iw:2*ih,vaguedenoiser,eq=brightness=-0.05:contrast=0.95:saturation=0.95,hqdn3d=4:3:6:4.5,deband,convolution,unsharp=23:3:1.8[top]`,
    `[top]pad=iw:2*ih,eq=brightness=-0.05:contrast=0.95:saturation=0.95[top]`,
    `[bottom]boxblur=10,eq=brightness=-0.45:contrast=0.9:saturation=0.4[bottom]`,
    `[top][bottom]overlay=0:h[full]`,
    `[full]crop=${width}:${height}:0:0[output]`,
    `[1]scale=${width / 4}:-1[logo]`,
    `[output][logo]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)*${logoPosition}[output]`,
    // `[full]scale=${width}:${height},setsar=1:1,format=gbrp[output]`,
    ...captions,
    `[output]pad=iw:ih+ih*0.15:(iw-iw)/2:(ih*0.15)/2:black`,
  ].join(";");

  cmd += `" -shortest output.mp4`;

  if (!process.env.GITHUB_TOKEN) {
    return Response.json(
      {
        error: "Github Token is missing.",
      },
      { status: 400 }
    );
  }

  const {
    data: { workflows },
  } = await axios.get(`${GITHUB_ENDPOINT}/actions/workflows`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    },
  });

  if (workflows.length === 0)
    return Response.json({
      success: false,
      error: "Workflow not found.",
    });

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
    return Response.json({
      success: true,
    });
  } catch (err: any) {
    return Response.json(err.response.data, {
      status: err.response.data.status,
    });
  }
}
