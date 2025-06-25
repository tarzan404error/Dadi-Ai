import { type NextRequest, NextResponse } from "next/server"

const MURF_KEY = process.env.MURF_API_KEY || "ap2_20674f19-a49a-485e-9dd8-bd8c1738953d"
const ENDPOINT = "https://api.murf.ai/v1/speech"
const MAX_CHARS = 500 // Murf hard-limit per request

let cachedVoice: string | null = null // stays warm per Lambda instance

type MurfVoice = {
  voice_id: string
  language: string
  gender: "male" | "female"
  styles?: string[]
}

// Utility – split long text into ~sentence chunks ≤ MAX_CHARS
function chunkText(text: string) {
  const out: string[] = []
  let buf = ""
  text.split(/(\.|\?|!|\n)/).forEach((p) => {
    if ((buf + p).length > MAX_CHARS) {
      out.push(buf.trim())
      buf = p
    } else {
      buf += p
    }
  })
  if (buf.trim()) out.push(buf.trim())
  return out
}

async function getHindiFemaleVoice(): Promise<string> {
  if (cachedVoice) return cachedVoice

  const res = await fetch(`${ENDPOINT}/voices`, {
    headers: { "api-key": MURF_KEY },
  })
  if (!res.ok) throw new Error("Cannot fetch voice list")

  const voices: MurfVoice[] = await res.json()

  const hindi = voices.find(
    (v) =>
      v.language.toLowerCase().startsWith("hi") &&
      v.gender === "female" &&
      (v.styles?.includes("Conversational") || true),
  )

  cachedVoice = hindi?.voice_id || "en-US-shirley" // fallback
  return cachedVoice
}

export async function POST(req: NextRequest) {
  const { text } = (await req.json()) as { text: string }
  if (!text) return NextResponse.json({ error: "Text missing" }, { status: 400 })
  if (!MURF_KEY) return NextResponse.json({ error: "Murf API key missing" }, { status: 500 })

  try {
    const voice_id = await getHindiFemaleVoice()
    const chunks = chunkText(text)
    const audioUrls: string[] = []

    for (const part of chunks) {
      const res = await fetch(`${ENDPOINT}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": MURF_KEY,
        },
        body: JSON.stringify({
          voice_id,
          text: part,
          output_format: "MP3",
          style: "Conversational",
          rate: -10,
          pitch: 5,
        }),
      })

      if (!res.ok) {
        console.error("Murf snippet error", await res.text())
        throw new Error("Murf generation failed")
      }

      const { audio_file } = await res.json()
      audioUrls.push(audio_file)
    }

    return NextResponse.json({ audioUrls })
  } catch (err) {
    console.error("Murf error", err)
    return NextResponse.json({ error: "Voice generation failed", fallback: true }, { status: 502 })
  }
}
