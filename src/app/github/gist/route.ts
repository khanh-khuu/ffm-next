import { GIST_ENDPOINT } from "@/constant";
import axios from "axios";

export async function GET() {
  const { data } = await axios.get(
    `${GIST_ENDPOINT}/gists/33fdba0de6335669ecbdf023ef334c08`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    }
  );
  const content = JSON.parse(data.files[Object.keys(data.files)[0]].content);
  return Response.json(content);
}

export async function POST(req: Request) {
  const json = await req.json();
  console.log(process.env.GITHUB_TOKEN)
  await axios.patch(
    `${GIST_ENDPOINT}/gists/33fdba0de6335669ecbdf023ef334c08`,
    {
      description: "Update Config",
      files: { "ffm-next.json": { content: JSON.stringify(json) } },
    },
    {
      headers: 
      {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    }
  );
  return Response.json({
    success: true,
  })
  // return GET();
}
