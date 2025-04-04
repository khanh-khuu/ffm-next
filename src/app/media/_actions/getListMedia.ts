'use server'
import fs from "fs";

export default async function getListMedia() {
    await Promise.resolve();
    if (!fs.existsSync("/tmp/media")) return [];
    const files = fs.readdirSync("/tmp/media", { withFileTypes: true });
    return files.filter((x) => x.isFile()).map((x) => x.name);
}
