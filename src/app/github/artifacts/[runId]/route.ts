import fs from "fs";
import path from "path";
import axios from "axios";
import unzipper from "unzipper";
import { NextRequest } from "next/server";
import { GITHUB_ENDPOINT } from "@/constant";
// import mime from 'mime';

export async function GET (request: NextRequest, { params: {runId} }: any) {
  const download = new URL(request.url).searchParams.get('download');

  if (!process.env.GITHUB_TOKEN) {
    return Response.json(
      {
        error: "Github Token is missing.",
      },
      { status: 400 }
    );
  }
  const endpoint = `${GITHUB_ENDPOINT}/actions/runs/${runId}/artifacts`;

  const { data } = await axios.get(endpoint, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    },
  });

  const downloadUrl = data.artifacts[0].archive_download_url;

  const downloadResponse = await axios({
    url: downloadUrl,
    method: "get",
    responseType: "stream",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    },
  });

  const tempZipPath = path.join("/tmp", "temp.zip");
  const outputPath = path.join("/tmp");

  downloadResponse.data.pipe(fs.createWriteStream(tempZipPath));

  await new Promise((resolve, reject) => {
    downloadResponse.data.on("end", () => resolve(null));
    downloadResponse.data.on("error", reject);
  });

  await new Promise((resolve, reject) => {
    fs.createReadStream(tempZipPath)
      .pipe(unzipper.Extract({ path: outputPath }))
      .promise()
      .then(() => {
        resolve(null);
      })
      .catch(reject);
  });

  const outputFile = path.join('/tmp', 'output.mp4');

  // fs.accessSync(outputFile);
  const fileBuffer = fs.readFileSync(outputFile);
  const fileStat = fs.statSync(outputFile);
  // const fileMime = mime.getType(outputFile);
  // console.log(fileMime);

  const headers: Record<string, string> = {
    "Content-Type": "video/mp4", // || fileMime || "application/octet-stream",
    "Content-Length": fileStat.size.toString(),
  };

  if (download !== null) {
    headers["Content-Disposition"] = `attachment; filename="${runId}.mp4"`;
  }
  return new Response(fileBuffer, {
    headers,
  });
}
