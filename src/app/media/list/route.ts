import fs from "fs";

export async function GET() {
  if (!fs.existsSync("/tmp/media")) return Response.json([]);
  const files = fs.readdirSync("/tmp/media", { withFileTypes: true });
  return Response.json(files.filter((x) => x.isFile()).map((x) => x.name));
}
