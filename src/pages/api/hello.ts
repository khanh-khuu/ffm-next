import { NextApiHandler } from "next";

const handler: NextApiHandler = (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Content-Encoding", "none");
    
    let counter = 0;
    res.write('event: message\n');
    const interval = setInterval(() => {
        counter++;
        res.write(`data:${counter}\n\n`);

        if (counter >= 5) {
            clearInterval(interval);
            res.end();
        }
    }, 500);
}

export default handler;
