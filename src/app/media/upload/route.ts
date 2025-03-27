import path from "path";
import fs from "fs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file) {
    return Response.json(
      {
        error: "No file received.",
      },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await (file as File).arrayBuffer());

  if (!fs.existsSync(path.join('/tmp', 'media'))) {
    fs.mkdirSync(path.join('/tmp', 'media'));
  }

  const fileName = Date.now() + '-' + (file as File).name;

  const outputPath = path.join('/tmp', 'media', fileName);
  fs.writeFileSync(outputPath, buffer);

  return Response.json({
    url: `/media/${fileName}`
  });
}
