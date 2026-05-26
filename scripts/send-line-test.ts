import fs from "fs";
import path from "path";
import sharp from "sharp";
import { getLineToken } from "../server/line";

const TO = "Uecb97d0ef5b5bfa232d24893c35bfa42";
const SHOTS_DIR = "attached_assets/screenshots";
const FILES: Record<string, string> = {
  "linebind": "35b01c9c-e144-4845-804d-493efef1bdbc-00-1f48xp0bjovrd_worf_replit_dev_mockup_preview_line-cards_LineBindSuccess.png",
  "lowcredits": "35b01c9c-e144-4845-804d-493efef1bdbc-00-1f48xp0bjovrd_worf_replit_dev_mockup_preview_line-cards_LowCredits.png",
};

async function main() {
  const host = process.env.REPLIT_DOMAINS?.split(",")[0].trim();
  if (!host) throw new Error("REPLIT_DOMAINS not set");
  const PUBLIC_DIR = path.join("client", "public", "line-test");
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  console.log("public dir:", PUBLIC_DIR, " host:", host);

  function writeAndUrl(buf: Buffer, name: string) {
    const filename = `${Date.now()}-${name}`;
    const fullPath = path.join(PUBLIC_DIR, filename);
    fs.writeFileSync(fullPath, buf);
    return `https://${host}/line-test/${filename}`;
  }

  const messages: any[] = [];
  for (const [label, file] of Object.entries(FILES)) {
    const raw = fs.readFileSync(path.join(SHOTS_DIR, file));
    const trimmed = await sharp(raw).trim({ threshold: 15 }).toBuffer();
    const meta = await sharp(trimmed).metadata();
    console.log(`${label}: trimmed → ${meta.width}x${meta.height}`);
    const original = await sharp(trimmed).resize({ width: Math.min(1040, meta.width || 1040), withoutEnlargement: true }).jpeg({ quality: 92 }).toBuffer();
    const preview  = await sharp(trimmed).resize({ width: 240, withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
    const urlO = writeAndUrl(original, `${label}-o.jpg`);
    const urlP = writeAndUrl(preview,  `${label}-p.jpg`);
    console.log(" original:", urlO);
    console.log(" preview :", urlP);
    messages.push({ type: "image", originalContentUrl: urlO, previewImageUrl: urlP });
  }

  console.log("--- pushing to LINE ---");
  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await getLineToken()}`,
    },
    body: JSON.stringify({ to: TO, messages }),
  });
  console.log("status:", res.status);
  console.log("body:", await res.text());
}

main().catch((e) => { console.error(e); process.exit(1); });
