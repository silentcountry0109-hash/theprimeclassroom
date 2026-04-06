import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import sharp from "sharp";

const HEADSHOT_PROMPT = `Transform this photo into a professional teacher portrait for a children's math tutoring center:
- Keep the facial features of the person in the uploaded image exactly consistent.
- Professional yet warm and approachable expression.
- Background: a bright, clean math classroom — a whiteboard or blackboard behind the subject with math formulas, equations, and geometric diagrams written on it; natural daylight from a window on the side, warm and inviting atmosphere.
- Attire: formal dark navy business suit with a white dress shirt (for men); formal dark navy blazer with a white blouse (for women). No casual clothing.
- Soft natural lighting with slight warm tone, no harsh shadows.
- Portrait aspect ratio 3:4, centered composition, upper body visible (head to just below the waist).
- Ultra-realistic, high quality. No text overlays on the person.`;

const uploadsDir = path.join(process.cwd(), "uploads");

async function cropTo3x4(inputBuffer: Buffer): Promise<Buffer> {
  const metadata = await sharp(inputBuffer).metadata();
  const { width = 600, height = 800 } = metadata;

  const targetRatio = 3 / 4;
  const currentRatio = width / height;

  let cropWidth: number;
  let cropHeight: number;
  let left: number;
  let top: number;

  if (currentRatio > targetRatio) {
    cropHeight = height;
    cropWidth = Math.round(height * targetRatio);
    left = Math.round((width - cropWidth) / 2);
    top = 0;
  } else {
    cropWidth = width;
    cropHeight = Math.round(width / targetRatio);
    left = 0;
    top = Math.round((height - cropHeight) / 2);
  }

  return sharp(inputBuffer)
    .extract({ left, top, width: cropWidth, height: cropHeight })
    .resize(600, 800, { fit: "fill" })
    .jpeg({ quality: 92 })
    .toBuffer();
}

export async function generateCoachHeadshot(
  originalFilePath: string,
  mimeType: string = "image/jpeg"
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[gemini-image] GEMINI_API_KEY not set — skipping AI generation");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const imageData = fs.readFileSync(originalFilePath);
    const base64Data = imageData.toString("base64");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            { text: HEADSHOT_PROMPT },
          ],
        },
      ],
      config: {
        responseModalities: ["Text", "Image"],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        const rawBuffer = Buffer.from(part.inlineData.data, "base64");

        const croppedBuffer = await cropTo3x4(rawBuffer);

        const filename = `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
        const outPath = path.join(uploadsDir, filename);
        fs.writeFileSync(outPath, croppedBuffer);
        return `/uploads/${filename}`;
      }
    }

    console.warn("[gemini-image] No image returned in Gemini response");
    return null;
  } catch (err) {
    console.error("[gemini-image] Generation failed:", err);
    return null;
  }
}
