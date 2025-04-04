'use server'

import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

export default async function uploadVideo(file: File) {
  const buffer = Buffer.from(await (file as File).arrayBuffer());
  
  const outputPath = path.join("/tmp", "input.mp4");
  fs.writeFileSync(outputPath, buffer);

  const { duration, height, width } = await new Promise<{
    duration: number;
    height: number;
    width: number;
  }>((resolve, reject) => {
    ffmpeg.ffprobe(outputPath, function (err, metadata) {
      if (err) reject(err);
      else {
        const height = metadata.streams.find((x) => x.height)?.height || 0;
        const width = metadata.streams.find((x) => x.width)?.width || 0;

        resolve({
          duration: metadata.format.duration!,
          height,
          width,
        });
      }
    });
  });

  await new Promise((resolve) => {
    ffmpeg(outputPath)
      .on("end", resolve)
      .screenshots({
        count: 1,
        filename: "thumbnail.png",
        timestamps: ["30%"],
        folder: "/tmp",
      });
  });

  return {
    description: (file as File).name.replaceAll('.mp4', ''),
    thumbnail: `/file/thumbnail.png?t=${Date.now()}`,
    duration,
    height,
    width,
  };
}
