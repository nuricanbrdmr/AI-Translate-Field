import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY missing on server" },
        { status: 500 }
      );
    }

    const model = "gemini-2.5-flash";
    const prompt = [
      "Verilen metnin dil kodunu tespit et.",
      "Sadece ISO 639-1 iki harfli küçük harf dil kodunu JSON olarak döndür.",
      'Format: {"lang":"en"}',
      "Metin:",
      "---",
      text,
      "---",
    ].join("\n");

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            response_mime_type: "application/json",
            temperature: 0,
          },
        }),
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Detection failed" }, { status: 500 });
    }
    const data = await res.json();
    const candidates = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    let lang = "";
    try {
      const parsed = JSON.parse(candidates || "{}");
      if (parsed && typeof parsed.lang === "string") {
        lang = parsed.lang.toLowerCase();
      }
    } catch {}
    if (!lang || lang.length !== 2) {
      return NextResponse.json(
        { error: "Could not detect language" },
        { status: 422 }
      );
    }
    return NextResponse.json({ lang });
  } catch (e) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
