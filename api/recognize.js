// Vercel Serverless Function: Recognize emballage from photo via OpenAI Vision
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_KEY) {
    return res.status(500).json({ error: "OPENAI_API_KEY not configured" });
  }

  try {
    const { image, knownTypes } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

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

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: image.startsWith("data:") ? image : `data:image/jpeg;base64,${image}`,
                  detail: "low", // Use low detail to keep costs down (~$0.003 per image)
                },
              },
            ],
          },
        ],
        max_tokens: 200,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI API error: ${err}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

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
