'use server'

import path from "path";
import fs from "fs";

export async function uploadMedia(file: File) {
//   const file = formData.get("file");

  if (!file) throw new Error("No file received.");

  const buffer = Buffer.from(await (file as File).arrayBuffer());

  if (!fs.existsSync(path.join('/tmp', 'media'))) {
    fs.mkdirSync(path.join('/tmp', 'media'));
  }

  const fileName = Date.now() + '-' + (file as File).name;

  const outputPath = path.join('/tmp', 'media', fileName);
  fs.writeFileSync(outputPath, buffer);

  return {
    url: `/media/${fileName}`
  };
}
