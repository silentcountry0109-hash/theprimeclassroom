import { GoogleGenAI } from "@google/genai";

export interface FranchiseDescriptionInput {
  name: string;
  city?: string;
  district?: string;
  address?: string;
  nearbySchools?: string[];
  tags?: string[];
  maxSeats?: number;
}

export async function generateFranchiseDescription(
  input: FranchiseDescriptionInput
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[gemini-text] GEMINI_API_KEY not set — skipping AI generation");
    return null;
  }

  const { name, city, district, address, nearbySchools = [], tags = [], maxSeats } = input;

  const locationParts = [city, district, address].filter(Boolean).join(" ");
  const schoolsPart = nearbySchools.length > 0
    ? `鄰近學校：${nearbySchools.join("、")}`
    : "";
  const tagsPart = tags.length > 0
    ? `特色標籤：${tags.join("、")}`
    : "";
  const seatsPart = maxSeats ? `最多同時容納 ${maxSeats} 位學生（小班教學）` : "";

  const prompt = `你是質數教室（The Prime 質數教室）的文案撰寫師。請根據以下資訊，為「${name}」撰寫一段分校介紹文案。

分校資訊：
- 名稱：${name}
${locationParts ? `- 位置：${locationParts}` : ""}
${schoolsPart ? `- ${schoolsPart}` : ""}
${tagsPart ? `- ${tagsPart}` : ""}
${seatsPart ? `- ${seatsPart}` : ""}

撰寫要求：
- 使用繁體中文
- 語氣溫暖、親切、專業，適合國小學生的家長閱讀
- 強調小班個別指導的教學模式、地點便利性、優質師資
- 約 80 至 120 字，不要超過 120 字
- 不要加標題，只輸出純文字段落
- 不要使用條列式格式`;

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    return text ? text.trim() : null;
  } catch (err) {
    console.error("[gemini-text] Generation failed:", err);
    return null;
  }
}
