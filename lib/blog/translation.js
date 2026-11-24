import "server-only";
const MODEL = "gemini-3.1-flash-lite";
export async function translateBlogFields(fields, sourceLocale) {
  if (sourceLocale !== "id" && sourceLocale !== "en") throw new Error("INVALID_SOURCE_LOCALE");
  const entries = Object.entries(fields).filter(([, value]) => typeof value === "string" && value.trim());
  if (!entries.length) throw new Error("ARTICLE_CONTENT_REQUIRED");
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("TRANSLATION_NOT_CONFIGURED");
  const targetLocale = sourceLocale === "id" ? "en" : "id";
  const sourceName = sourceLocale === "id" ? "Indonesian" : "English";
  const targetName = targetLocale === "id" ? "Indonesian" : "English";
  const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + MODEL + ":generateContent";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: "You are a professional editorial translator. Translate every supplied article field faithfully from " + sourceName + " into " + targetName + ". Preserve meaning, facts, names, product names, URLs, quoted text, paragraph breaks, lists, punctuation, and tone. Do not summarize, add claims, or translate URLs. Return only a JSON object with exactly the same keys and string values." }] },
      contents: [{ role: "user", parts: [{ text: JSON.stringify({ sourceLanguage: sourceName, targetLanguage: targetName, fields: Object.fromEntries(entries) }) }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.1, maxOutputTokens: 16000 },
    }),
    signal: AbortSignal.timeout(45000),
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    console.error("Blog translation provider error:", response.status, payload?.error?.status || "unknown");
    throw new Error("TRANSLATION_FAILED");
  }
  const output = payload?.candidates?.[0]?.content?.parts?.map(part => typeof part.text === "string" ? part.text : "").join("").trim();
  if (!output) throw new Error("TRANSLATION_FAILED");
  let translated;
  try { translated = JSON.parse(output); } catch { throw new Error("TRANSLATION_FAILED"); }
  if (!translated || typeof translated !== "object" || Array.isArray(translated) || Object.keys(translated).length !== entries.length) throw new Error("TRANSLATION_FAILED");
  for (const [key] of entries) if (typeof translated[key] !== "string" || !translated[key].trim()) throw new Error("TRANSLATION_FAILED");
  if ((translated.content || "").length > 60000) throw new Error("TRANSLATION_FAILED");
  return translated;
}
export function mapBlogFields(fields, locale) {
  const suffix = locale === "en" ? "_en" : "_id";
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key + suffix, value]));
}
