import axios from "axios";

export async function GET(request: Request, { params }: any) {
  const { videoId } = await params;

  const { data } = await axios.get<VideoCount>(
    "https://tiktok.livecounts.io/video/stats/" + videoId,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0",
        Origin: "https://tokcounter.com",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
  return Response.json(data);
}
