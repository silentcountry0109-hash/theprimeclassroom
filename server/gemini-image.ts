import { GoogleGenAI, Modality } from "@google/genai";
import fs from "fs";
import path from "path";

const HEADSHOT_PROMPT = `Transform this photo into a professional teacher headshot for a children's math tutoring center:
- Keep the facial features of the person in the uploaded image exactly consistent.
- Professional yet warm and approachable look suitable for an educational setting.
- Clean solid light gray or soft white studio background.
- Neat, professional attire (no casual wear).
- Soft studio lighting, slight warm tone.
- Portrait aspect ratio 3:4, centered composition, shoulders clearly visible.
- Ultra-realistic, high quality. No text overlays.`;

const uploadsDir = path.join(process.cwd(), "uploads");

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
      model: "gemini-2.0-flash-preview-image-generation",
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
        responseModalities: [Modality.IMAGE],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        const aiImageBuffer = Buffer.from(part.inlineData.data, "base64");
        const ext = part.inlineData.mimeType?.includes("png") ? ".png" : ".jpg";
        const filename = `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
        const outPath = path.join(uploadsDir, filename);
        fs.writeFileSync(outPath, aiImageBuffer);
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
