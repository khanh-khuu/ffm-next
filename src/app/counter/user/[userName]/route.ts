import axios from "axios";

export async function GET(request: Request, {params}: any) {
  const { userName } = await params;

  const { data } = await axios.get(
    "https://tiktok.livecounts.io/user/data/" + userName,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0",
        Origin: "https://tokcounter.com",
      },
    }
  );
  return Response.json(data);
}
