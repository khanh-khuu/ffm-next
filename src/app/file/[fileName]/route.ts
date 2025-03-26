import path from "path";
import fs from 'fs';
import mime from 'mime';

export function GET(request: Request, { params: { fileName } }: any) {
  const download = new URL(request.url).searchParams.get("download");

  const fullPath = path.join("/tmp", fileName!);

  fs.accessSync(fullPath);

  const fileBuffer = fs.readFileSync(fullPath);
  const fileStat = fs.statSync(fullPath);
  const fileMime = mime.getType(fullPath);

  const headers: Record<string, string> = {
    "Content-Type": fileMime || "application/octet-stream",
    "Content-Length": fileStat.size.toString(),
  };

  if (download !== null) {
    headers["Content-Disposition"] = `attachment; filename="${fileName}"`;
  }
  return new Response(fileBuffer, {
    headers,
  });
}
