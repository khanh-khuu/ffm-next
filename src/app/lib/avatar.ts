import path from 'path';
import fs from 'fs';

export function getAvatars() {
    const tempPath = path.join(process.cwd(), 'public', 'avatars');
    
    if (!fs.existsSync(tempPath)){
        fs.mkdirSync(tempPath, { recursive: true });
    }

    const files = fs.readdirSync(tempPath);
    return files;
}