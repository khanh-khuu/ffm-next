'use server'

import axios from "axios";
import path from "path";
import fs from "fs";
import YTDlpWrap from "yt-dlp-wrap";
import { getFbVideoInfo } from "fb-downloader-scrapper";
import he from "he";
import ffmpeg from "fluent-ffmpeg";

async function downloadYoutube(
  url: string,
  outputPath: string
): Promise<string> {
  const dlp = new YTDlpWrap(path.join(process.cwd(), "lib", "yt-dlp"));
  return new Promise((resolve) => {
    dlp.exec([url, "-f", "best", "-o", outputPath]).on("close", async () => {
      const meta = await dlp.getVideoInfo(url);
      resolve(meta.title);
    });
  });
}

async function downloadYoutube2(
  url: string,
  outputPath: string
): Promise<string> {

  const fileResponse = await axios({
    method: "GET",
    url: "https://ffm-next.khanhkhuu.workers.dev/?url=" + url,
    responseType: "stream",
    headers: {
      "Content-Type": "video/mp4",
    },
  });

  const writer = fs.createWriteStream(outputPath);

  fileResponse.data.pipe(writer);

  const desc = fileResponse.headers['x-description'];

  return new Promise((resolve) => {
    writer.on("finish", () => {
      resolve(desc);
    });
  });
}

async function downloadTiktok(url: string, outputPath: string): Promise<any> {
  function extractUrl(input: string) {
    const regex = /playAddr":"([^"]+)/;
    const match = regex.exec(input);

    if (match && match[1]) {
      return JSON.parse(`"${match[1]}"`);
    } else {
      return null;
    }
  }

  function extractDesc(input: string) {
    const regex = /"desc":"([^"]+)/;
    const match = regex.exec(input);

    if (match && match[1]) {
      return JSON.parse(`"${match[1]}"`);
    } else {
      return null;
    }
  }

  const response = await axios.get(url);
  const headers = response.headers;
  const downloadUrl = extractUrl(response.data);
  const desc = extractDesc(response.data);
  const cookies = headers["set-cookie"]!;
  const cookie = cookies.map((x) => x.split(";")[0]).join(";");

  const fileResponse = await axios({
    method: "GET",
    url: downloadUrl,
    responseType: "stream",
    headers: {
      "Content-Type": "video/mp4",
      Cookie: cookie,
    },
  });

  const writer = fs.createWriteStream(outputPath);

  fileResponse.data.pipe(writer);

  return new Promise((resolve) => {
    writer.on("finish", () => {
      resolve(desc);
    });
  });
}

async function downloadTiktok2(url: string, outputPath: string): Promise<string> {
  const endpoint = 'https://ilovetik.net/proxy.php';
  const { data } = await axios.post<iLoveTikResponse>(endpoint, 
    'url=' + url
  );

  const desc = data.api.description;

  const fileResponse = await axios({
    method: "GET",
    url: data.api.previewUrl,
    responseType: "stream",
    headers: {
      "Content-Type": "video/mp4",
    },
  });

  const writer = fs.createWriteStream(outputPath);

  fileResponse.data.pipe(writer);

  return new Promise((resolve) => {
    writer.on("finish", () => {
      resolve(desc);
    });
  });

} 


async function downloadKuaishou(
  url: string,
  outputPath: string
): Promise<string> {
  function extractUrl(input: string) {
    const regex = /"url":"([^"]+)/;
    const match = regex.exec(input);

    if (match && match[1]) {
      return JSON.parse(`"${match[1]}"`);
    } else {
      return null;
    }
  }

  function extractDesc(input: string) {
    const regex = /"caption":"([^"]+)/;
    const match = regex.exec(input);

    if (match && match[1]) {
      return JSON.parse(`"${match[1]}"`);
    } else {
      return null;
    }
  }

  const headers = {
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Language": "vi,en-US;q=0.9,en;q=0.8,fr-FR;q=0.7,fr;q=0.6",
    "Cache-Control": "max-age=0",
    Connection: "keep-alive",
    Cookie:
      "kpf=PC_WEB; clientid=3; did=web_5b92606c2aee16f4a5632b488adf96bf; didv=1734623899000; kwpsecproductname=PCLive; kwfv1=GALIG9Qf8B0L7PAq0lwBP9G9QDG0HUGfLEPnb0+/LAweWUGA4jP0bSPBcF+0qUP0LUGADFG/DM+A8YP0SjGA+Dw/DEw/zD8/ZM+frlG0YSP/Qj+fHEPAq7+/rFw/WA+Arh8/mf+eY0P0DF+/HF+9rI+BHMPAWM+eWIGA8YPnrhw/c=; userId=3885181847; kuaishou.server.webday7_st=ChprdWFpc2hvdS5zZXJ2ZXIud2ViZGF5Ny5zdBKwAVeweNnCrjQCCGq4SZFeHy6z53hDW6JcyiCdLAWpiX-ibKJwuwSQR5rQ1JZ5UnCofDV7uD2G2eRe60IYv0SUZfIcC1gQZIT-tPxJKWob8ju0lz8ZXXRDl-2nDu75_1C_4-Qot1WO0KZ58KAnANOWubRv9HJ-Z5IsEFeIA3PoGZqrB2PzrF-ms1owxTjnhcymplb0_zYrP2vE2yAe4Kkxhf660B9Mi6937epjk58taXScGhKSiarCLStkfqMqbK__YwGl85IiIMXl6PUJmpfuoB275cWcwKdABKM7RP99Jrn7_ZICTcFUKAUwAQ; kuaishou.server.webday7_ph=679fc99aaed32f51d1f54c0a2d93fce48d62; kpn=KUAISHOU_VISION; did=web_5b92606c2aee16f4a5632b488adf96bf; clientid=3; kpf=PC_WEB; kpn=KUAISHOU_VISION",
    Referer: "https://www.google.com/",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
    "sec-ch-ua":
      '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
  };

  const { data } = await axios.get(url, {
    headers,
  });

  const downloadUrl = extractUrl(data);
  const desc = extractDesc(data);

  const fileResponse = await axios.get(downloadUrl, {
    responseType: "stream",
    headers: {
      "Content-Type": "video/mp4",
    },
  });

  fileResponse.data.on("data", (chunk: any) => {
    console.log("chunk", chunk.length);
  });

  const writer = fs.createWriteStream(outputPath);
  return new Promise((resolve) => {
    writer.on("finish", () => {
      resolve(desc);
    });

    fileResponse.data.pipe(writer);
  });
}

async function downloadFacebook(
  url: string,
  outputPath: string
): Promise<string> {
  const info = await getFbVideoInfo(url);

  const fileResponse = await axios.get(info.hd, {
    responseType: "stream",
    headers: {
      "Content-Type": "video/mp4",
    },
  });

  const writer = fs.createWriteStream(outputPath);
  return new Promise((resolve) => {
    writer.on("finish", () => {
      resolve(he.decode(info.title));
    });

    fileResponse.data.pipe(writer);
  });
}

function downloadVideo(url: string, outputPath: string): Promise<string> {
  const facebookRegex = /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com)\/.+/i;
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.be)\/.+/i;
  const tiktokRegex = /^(https?:\/\/)?(www\.)?(vt\.)?tiktok\.com\/.+/i;
  const kuaishouRegex = /^(https?:\/\/)?(www\.)?(v\.)?kuaishou\.com\/.+/i;

  if (facebookRegex.test(url)) {
    return downloadFacebook(url, outputPath);
  } else if (youtubeRegex.test(url)) {
    return downloadYoutube2(url, outputPath);
  } else if (tiktokRegex.test(url)) {
    return downloadTiktok2(url, outputPath);
  } else if (kuaishouRegex.test(url)) {
    return downloadKuaishou(url, outputPath);
  } else {
    throw new Error("lỗi link không hỗ trợ");
  }
}

export default async function importVideo(downloadUrl: string) {
  if (!downloadUrl) throw new Error("Download Url is missing.");

  const outputPath = path.join("/tmp", "input.mp4");

  const description = await downloadVideo(downloadUrl, outputPath);

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
    description,
    thumbnail: `/file/thumbnail.png?t=${Date.now()}`,
    duration,
    height,
    width,
  };
}
