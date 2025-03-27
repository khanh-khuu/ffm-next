import path from "path";
import fs from "fs";
import mime from "mime";

export async function GET(request: Request, { params }: any) {
  const { fileName } = await params;
  const download = new URL(request.url).searchParams.get("download");
  const filePath = path.join("/tmp", "media", fileName!);
  const fileMime = mime.getType(filePath);
  const stat = fs.statSync(filePath);

  const headers: Record<string, string> = {
    "Content-Type": fileMime || "application/octet-stream",
    "Content-Length": stat.size.toString(),
  };
  
  if (download !== null) {
    headers["Content-Disposition"] = `attachment; filename="${fileName}"`;
  }

  const fileStream = fs.createReadStream(filePath);

  return new Response(
    new ReadableStream({
      start(controller) {
        fileStream.on("data", (chunk) => controller.enqueue(chunk));
        fileStream.on("end", () => controller.close());
        fileStream.on("error", (error) => controller.error(error));
      },
      cancel() {
        fileStream.destroy();
      },
    }),
    { headers }
  );
}

export async function DELETE(equest: Request, { params }: any) {
  const { fileName } = await params;

  fs.unlinkSync(`/tmp/media/${fileName}`);

  return Response.json({
    success: true
  })
}