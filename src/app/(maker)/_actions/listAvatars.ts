'use server'

import path from 'path';
import fs from 'fs';

export default async function listAvatars() {
    const tempPath = path.join(process.cwd(), 'public', 'avatars');
    
    if (!fs.existsSync(tempPath)){
        fs.mkdirSync(tempPath, { recursive: true });
    }
    await Promise.resolve();
    const files = fs.readdirSync(tempPath);
    return files;
}