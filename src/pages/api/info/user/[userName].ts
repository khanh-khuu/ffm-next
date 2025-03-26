import axios from "axios";
import { NextApiHandler } from "next";


const handler: NextApiHandler = async (req, res) => {
    const { userName } = req.query;

    const { data } = await axios.get('https://tiktok.livecounts.io/user/search/' + userName, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0',
            'Accept-Encoding': 'gzip',
            'Origin': 'https://tokcounter.com',
            'Connection': 'keep-alive'
        }
    })

    res.json(data.userData[0]);
}

export default handler;