import path from "path";
import fs from 'fs';
import mime from 'mime';

export const maxDuration = 60;

// export function GET(request: Request, { params: { fileName } }: any) {
//   const download = new URL(request.url).searchParams.get("download");

//   const fullPath = path.join("/tmp", fileName!);

//   fs.accessSync(fullPath);

//   const fileBuffer = fs.readFileSync(fullPath);
//   const fileStat = fs.statSync(fullPath);
//   const fileMime = mime.getType(fullPath);

//   const headers: Record<string, string> = {
//     "Content-Type": fileMime || "application/octet-stream",
//     "Content-Length": fileStat.size.toString(),
//   };

//   if (download !== null) {
//     headers["Content-Disposition"] = `attachment; filename="${fileName}"`;
//   }
//   return new Response(fileBuffer, {
//     headers,
//   });
// }


export async function GET(request: Request, { params }: any) {
  const {fileName} = await params;
  // const download = new URL(request.url).searchParams.get("download");
  const filePath = path.join("/tmp", fileName!);
  const fileMime = mime.getType(filePath);
  const stat = fs.statSync(filePath);

  const headers = {
    'Content-Disposition': `attachment; filename=${fileName}`,
    'Content-Type': fileMime || "application/octet-stream",
    'Content-Length': stat.size.toString(),
  };

  // if (download !== null) {
  //   headers["Content-Disposition"] = `attachment; filename="${fileName}"`;
  // }

  const fileStream = fs.createReadStream(filePath);

  return new Response(new ReadableStream({
    start(controller) {
      fileStream.on('data', (chunk) => controller.enqueue(chunk));
      fileStream.on('end', () => controller.close());
      fileStream.on('error', (error) => controller.error(error));
    },
    cancel() {
      fileStream.destroy();
    },
  }), { headers });
}
