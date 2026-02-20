import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT =
  "Du bist ein hilfreicher Schullehrer und korrigierst handschriftliche Schülerarbeiten. Analysiere das hochgeladene Dokument und gib konstruktives, freundliches Feedback auf Deutsch. Nutze einfache, schülergerechte Sprache. Strukturiere deine Antwort so: **Was gut gelungen ist:** (liste Stärken auf), **Fehler:** (Rechtschreib-/Grammatikfehler auflisten), **Verbesserungsvorschläge:** (inhaltliche Tipps), **Notenvorschlag:** (1-6 mit kurzer Begründung)";

const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Keine Datei hochgeladen" }, { status: 400 });
    }

    if (!ACCEPTED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Nur JPG, PNG oder WebP Dateien sind erlaubt" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Die Datei ist zu groß. Maximal 10 MB erlaubt." },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = file.type;
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API-Schlüssel nicht konfiguriert" },
        { status: 500 }
      );
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: dataUrl },
              },
              {
                type: "text",
                text: "Bitte korrigiere diese Schülerarbeit.",
              },
            ],
          },
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("OpenRouter error:", response.status, errBody);
      return NextResponse.json(
        { error: "Fehler bei der KI-Analyse. Bitte versuche es später erneut." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const resultText =
      data.choices?.[0]?.message?.content || "Keine Antwort erhalten.";

    return NextResponse.json({ result: resultText });
  } catch (err) {
    console.error("Correction error:", err);
    return NextResponse.json(
      { error: "Ein unerwarteter Fehler ist aufgetreten." },
      { status: 500 }
    );
  }
}
