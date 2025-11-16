import { NextResponse } from "next/server";

// CORS whitelist
const allowedOrigins = [
  "https://full-my-portfolio-admin.vercel.app",
  "https://www.nuricanbirdemir.net.tr",
  "https://nuricanbirdemir.net.tr",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:4000",
];

// Helper: Free Translate API ile çeviri
const translateWithFreeAPI = async (
  text: string,
  sourceLang: string | null,
  targetLang: string
): Promise<string | null> => {
  try {
    const params = new URLSearchParams({
      dl: targetLang,
      text: text,
    });
    if (sourceLang && sourceLang !== "auto") {
      params.append("sl", sourceLang);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      `https://ftapi.pythonanywhere.com/translate?${params.toString()}`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data?.["destination-text"]) {
        return data["destination-text"].trim();
      }
    }
  } catch (e) {
    // Hata durumunda null döndür
  }
  return null;
};

// Helper: RapidAPI OpenL Translate ile çeviri
const translateWithRapidAPI = async (
  text: string,
  targetLang: string
): Promise<string | null> => {
  if (!process.env.RAPIDAPI_KEY) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      "https://openl-translate.p.rapidapi.com/translate/bulk",
      {
        method: "POST",
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
          "x-rapidapi-host": "openl-translate.p.rapidapi.com",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target_lang: targetLang,
          text: [text],
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data[0].trim();
      }
      if (
        data?.translations &&
        Array.isArray(data.translations) &&
        data.translations.length > 0
      ) {
        return data.translations[0].trim();
      }
    }
  } catch (e) {
    // Hata durumunda null döndür
  }
  return null;
};

// Helper: Gemini AI ile çeviri
const translateWithGemini = async (
  text: string,
  langs: string[],
  sourceLang: string | null
): Promise<Record<string, string> | null> => {
  if (!process.env.GEMINI_API_KEY) return null;

  const model = "gemini-2.5-flash";
  const src = sourceLang && sourceLang !== "auto" ? sourceLang : "auto";
  const langsCsv = langs.join(", ");

  const prompt = [
    `Kaynak dil: ${src === "auto" ? "Otomatik algıla" : src}`,
    `Hedef diller: ${langsCsv}`,
    `İstek: Metni her hedef dil için doğal, akıcı ve terminoloji korumalı şekilde çevir.`,
    `Çıkış formatı: SADECE geçerli JSON döndür (başka hiçbir şey ekleme).`,
    `Anahtarlar: hedef dil kodları (${langsCsv}). Değerler: sadece çeviri stringi.`,
    `Örn: {"en":"...","de":"..."}`,
    `Metin:`,
    `---`,
    `${text}`,
    `---`,
  ].join("\n");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(
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
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const firstText =
        parts.find((p: any) => typeof p?.text === "string")?.text || "{}";
      try {
        const obj = JSON.parse(firstText);
        const results: Record<string, string> = {};
        for (const lang of langs) {
          if (
            obj?.[lang] &&
            typeof obj[lang] === "string" &&
            obj[lang].trim().length > 0
          ) {
            results[lang] = obj[lang].trim();
          }
        }
        return Object.keys(results).length > 0 ? results : null;
      } catch {}
    }
  } catch (e) {
    // Hata durumunda null döndür
  }
  return null;
};

// CORS headers helper
const getCorsHeaders = (origin: string | null) => {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,Accept",
  };

  if (
    origin &&
    (allowedOrigins.includes(origin) || origin.includes("localhost"))
  ) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
  } else if (!origin) {
    headers["Access-Control-Allow-Origin"] = "*";
  }

  return headers;
};

export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin");
  return NextResponse.json({}, { headers: getCorsHeaders(origin) });
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Timeout guard - 25 saniye
  let timeoutFired = false;
  const overallTimeout = setTimeout(() => {
    timeoutFired = true;
  }, 25000);

  try {
    const { text, targetLangs, sourceLang } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      clearTimeout(overallTimeout);
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const langs: string[] =
      Array.isArray(targetLangs) && targetLangs.length > 0
        ? targetLangs
        : ["en", "de", "fr", "ar"];

    const results: Record<string, string> = {};
    const src = sourceLang && sourceLang !== "auto" ? sourceLang : null;

    // 1. Önce Gemini AI ile dene
    const geminiResults = await translateWithGemini(text, langs, sourceLang);
    if (geminiResults) {
      Object.assign(results, geminiResults);
    }

    // 2. Eksik diller için fallback API'leri kullan
    const langsToTranslate = langs.filter(
      (lang) => !results[lang] || results[lang].length === 0
    );

    if (langsToTranslate.length > 0) {
      const fallbackPromises = langsToTranslate.map(async (lang) => {
        let translatedText: string | null = null;

        // Önce Free Translate API'yi dene
        translatedText = await translateWithFreeAPI(text, src, lang);

        // Başarısız olursa RapidAPI'yi dene
        if (!translatedText) {
          translatedText = await translateWithRapidAPI(text, lang);
        }

        return { lang, text: translatedText || "" };
      });

      const fallbackResults = await Promise.allSettled(fallbackPromises);
      fallbackResults.forEach((result) => {
        if (result.status === "fulfilled" && result.value.text) {
          results[result.value.lang] = result.value.text;
        }
      });
    }

    // Boş olanlar için boş string set et
    for (const lang of langs) {
      if (!results[lang]) {
        results[lang] = "";
      }
    }

    clearTimeout(overallTimeout);

    if (timeoutFired) {
      return NextResponse.json(
        {
          timeout: true,
          message: "İşlem zaman aşımına uğradı, mevcut sonuçlar gönderiliyor",
          ...results,
        },
        { status: 200, headers: corsHeaders }
      );
    }

    return NextResponse.json(results, { headers: corsHeaders });
  } catch (e: any) {
    clearTimeout(overallTimeout);
    console.error("/api/translate error:", e);

    if (
      e?.message?.includes("timeout") ||
      e?.code === "ECONNABORTED" ||
      e?.name === "AbortError"
    ) {
      return NextResponse.json(
        {
          error: "Translate timeout",
          message: "İstek zaman aşımına uğradı. Lütfen tekrar deneyin.",
        },
        { status: 504, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        error: "Translate failed",
        details: e?.message ?? String(e),
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
