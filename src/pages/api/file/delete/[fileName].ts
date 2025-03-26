import { NextApiHandler } from "next";
import fs from 'fs';
import path from 'path';

const handler: NextApiHandler = (req, res) => {
    const {fileName} = req.query;
    const filePath = path.join(process.cwd(),  'public', 'temp', fileName as string);
    fs.unlink(filePath, (err) => {
        if (err) {
            res.status(403).send(err.message);
        }
        res.json({
            fileName,
            filePath,
        })
    })
    res.json(req.query);
}

export default handler;
