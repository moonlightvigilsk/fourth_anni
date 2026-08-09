import { Config } from "@netlify/functions";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { cards, topic, question } = await req.json();

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return new Response(
        JSON.stringify({ error: "cards is empty or missing" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "service_unavailable" }), {
        status: 503,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Build the prompt in Vietnamese
    const systemPrompt = `You are a mystical tarot reader for a 4-year anniversary celebration of a Vietnamese VTuber team (LL Team). Your reading style is warm, poetic, and slightly cosmic — not cold or clinical. Always respond in Vietnamese.`;
    
    let cardsPrompt = `Các lá bài đã rút được:\n`;
    cards.forEach((c: any, index: number) => {
      const positionStr = c.position ? ` ở vị trí "${c.position}"` : "";
      cardsPrompt += `- Lá ${index + 1}: ${c.name} (${c.viName}), hướng: ${c.orientation === "reversed" ? "Ngược" : "Xuôi"}${positionStr}\n`;
    });

    const topicPrompt = `Chủ đề của buổi trải bài: ${topic}\n`;
    const questionPrompt = question ? `Câu hỏi của người xem: "${question}"\n` : "";

    const instructionPrompt = `Yêu cầu:\nWrite a cohesive tarot reading of 3-4 short paragraphs in Vietnamese. Each paragraph flows naturally. End with one short encouraging sentence relevant to the LL Team anniversary context.`;

    const prompt = `${systemPrompt}\n\n${topicPrompt}${questionPrompt}${cardsPrompt}\n${instructionPrompt}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!geminiResponse.ok) {
      console.error("Gemini API error status:", geminiResponse.status);
      return new Response(JSON.stringify({ error: "service_unavailable" }), {
        status: 503,
        headers: { "Content-Type": "application/json" }
      });
    }

    const data = await geminiResponse.json();
    const readingText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!readingText) {
      console.error("Gemini API returned empty response structure:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "service_unavailable" }), {
        status: 503,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ reading: readingText }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Netlify Function Error:", error);
    return new Response(JSON.stringify({ error: "service_unavailable" }), {
      status: 503,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const config: Config = {
  path: "/api/gemini-tarot"
};
