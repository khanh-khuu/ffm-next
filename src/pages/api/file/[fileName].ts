import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import mime from 'mime';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { fileName: filePath } = req.query;
  const fullPath = path.join(process.cwd(), 'public', 'temp', filePath as string);
  
  try {
    fs.accessSync(fullPath);

    const fileBuffer = fs.readFileSync(fullPath);
    const fileMime = mime.getType(fullPath);

    res.setHeader('Content-Type', fileMime || 'application/octet-stream');
    // res.setHeader('Content-Disposition', 'attachment; filename="' + filePath + '"');
    res.send(fileBuffer);
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      res.status(404).send('File not found');
    } else {
      console.error(err);
      res.status(500).send('Error reading file');
    }
  }
};

export default handler;