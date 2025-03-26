import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  const directoryPath = path.join(process.cwd(), 'public', 'temp');

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Unable to scan directory' });
    }

    for (const file of files) {
      fs.unlink(path.join(directoryPath, file), (unlinkErr) => {
        if (unlinkErr) {
          console.error(unlinkErr);
          return res.status(500).json({ error: 'Error deleting files' });
        }
      });
    }

    res.status(200).json({ message: 'All files deleted successfully' });
  });
};

export default handler;