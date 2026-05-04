// Vercel Serverless Function: Recognize emballage from photo via Claude Haiku Vision
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  }

  try {
    const { image, knownTypes } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    // Extract base64 data and media type from data URL
    const match = image.match(/^data:(image\/\w+);base64,(.+)$/);
    const mediaType = match ? match[1] : "image/jpeg";
    const base64Data = match ? match[2] : image;

    // Build the prompt with known emballage types for better matching
    const typesList = (knownTypes || []).map(t => `- ${t.name} (€${t.value})`).join("\n");

    const prompt = `Je bent een emballage-herkenningssysteem voor de horeca. Analyseer deze foto en identificeer welk type emballage je ziet.

Bekende emballage-types in het systeem:
${typesList || "Geen types bekend — beschrijf wat je ziet."}

Antwoord in dit exacte JSON formaat (geen andere tekst):
{
  "identified": true/false,
  "type": "exact naam uit de lijst hierboven, of een beschrijving als het niet in de lijst staat",
  "confidence": "high/medium/low",
  "quantity": geschat aantal (getal),
  "description": "korte beschrijving van wat je ziet in het Nederlands"
}

Als je geen emballage herkent, zet "identified" op false.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: base64Data,
                },
              },
              { type: "text", text: prompt },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Claude API error: ${err}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || "";

    // Parse JSON from response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return res.status(200).json(result);
      }
    } catch {}

    return res.status(200).json({
      identified: false,
      type: null,
      confidence: "low",
      quantity: 1,
      description: content,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
