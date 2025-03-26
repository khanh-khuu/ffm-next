import { GITHUB_ENDPOINT } from "@/constant";
import axios from "axios";
import _ from "lodash";

export async function GET() {
  const endpoint = `${GITHUB_ENDPOINT}/actions/runs`;
  try {
    const { data } = await axios.get(
      endpoint,
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      }
    );
    return Response.json(data);
  } catch (err: any) {
    return Response.json(err.response.data, {
      status: err.response.data.status,
    });
  }
};
