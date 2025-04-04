"use server";
import fs from "fs";

export default async function deleteMedia(fileName: string) {
  fs.unlinkSync(`/tmp/media/${fileName}`);
}
