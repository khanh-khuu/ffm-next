import { NextApiHandler } from "next";
import fs from 'fs';
import path from "path";

const handler: NextApiHandler = async (req, res) => {
    const tempPath = path.join(process.cwd(), 'public', 'temp');
    if (!fs.existsSync(tempPath)) {
        fs.mkdirSync(tempPath, { recursive: true });
    }

    const fileList = await new Promise((resolve, reject) => {
        fs.readdir(tempPath, (err, files) => {
            if (err) reject(err);
            resolve(files);
        });
    });
    
    res.json(fileList);
}

export default handler;