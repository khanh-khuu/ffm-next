import axios from "axios";

const url = 'https://www.clipto.com/api/youtube';
export async function GET() {
    const {data} = await axios.post(url, {
        "url":"https://m.youtube.com/watch?v=ozXL6S2CA3U"
    })

  return Response.json(data);
}
