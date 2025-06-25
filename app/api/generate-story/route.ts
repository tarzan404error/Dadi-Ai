import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { prompt, system } = (await req.json()) as { prompt: string; system?: string }

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is missing." }, { status: 400 })
  }

  const apiKey = "AIzaSyDzG82-a0cnbhsVfOW9KFly81GChbAfKo4"

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${system}\n\n${prompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2000, // Increased for longer stories
          },
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "कहानी बनाने में समस्या हुई।"

    return NextResponse.json({ text })
  } catch (err: any) {
    console.error("Story generation error:", err)
    return NextResponse.json(
      {
        error: "Story generation failed. Please try again.",
      },
      { status: 500 },
    )
  }
}
