import { promises as fs } from "fs";
import path from "path";

async function listFilesAndDirectories(dirPath: string): Promise<any> {
  let entries = await fs.readdir(dirPath, { withFileTypes: true });
  let filesAndDirs = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      filesAndDirs.push({
        name: entry.name,
        type: "directory",
        children: await listFilesAndDirectories(fullPath),
      });
    } else {
      filesAndDirs.push({
        name: entry.name,
        type: "file",
      });
    }
  }

  return filesAndDirs;
}

export async function GET() {
  const directoryPath =  '/var/task/node_modules/ffmpeg-ffprobe-static/'//path.join(process.cwd()); // Thay target-directory bằng thư mục bạn muốn liệt kê

  const result = await listFilesAndDirectories(directoryPath);
  return Response.json(result);
}
