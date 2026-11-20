import fs from "node:fs";
import path from "node:path";
import { photoSlots } from "@/content";

export type PhotoAvailability = Record<string, boolean>;

export function getPhotoAvailability(): PhotoAvailability {
  const root = path.join(process.cwd(), "public");
  const availability: PhotoAvailability = {};
  for (const [id, slot] of Object.entries(photoSlots)) {
    availability[id] = fs.existsSync(path.join(root, slot.file));
  }
  return availability;
}
