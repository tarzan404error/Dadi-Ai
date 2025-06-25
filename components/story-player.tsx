"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Play,
  Pause,
  Heart,
  Volume2,
  VolumeX,
  Monitor,
  MonitorOff,
  RotateCcw,
  Loader2,
  Settings,
  Mic,
} from "lucide-react"

interface User {
  name: string
  favorites: string[]
  history: Array<{
    id: string
    title: string
    category: string
    timestamp: number
  }>
}

interface StoryPlayerProps {
  category: string
  customThemes?: string
  user: User
  onBack: () => void
  onUpdateUser: (user: User) => void
}

interface VoiceSettings {
  rate: number
  pitch: number
  volume: number
  voice: string
  language: string
}

const categoryNames: Record<string, string> = {
  "raja-rani": "राजा रानी की कहानी",
  pariyon: "परियों की कहानी",
  jungle: "जंगल एडवेंचर",
  janwar: "जानवरों की मस्ती",
  mystery: "रहस्यमय कहानियां",
  moral: "नैतिक कहानियां",
  festival: "त्योहार स्पेशल",
  bedtime: "सोने की कहानियां",
  custom: "आपकी खास कहानी",
}

// Enhanced TTS Engine with grandmother-style voice
class GrandmaTTSEngine {
  private synthesis: SpeechSynthesis
  private voices: SpeechSynthesisVoice[] = []
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private settings: VoiceSettings
  private onStart?: () => void
  private onEnd?: () => void
  private onError?: () => void

  constructor() {
    this.synthesis = window.speechSynthesis
    this.settings = {
      rate: 0.7, // Slower for grandmother style
      pitch: 1.2, // Higher pitch for warmth
      volume: 0.8,
      voice: "",
      language: "hi-IN",
    }
    this.loadVoices()
  }

  private loadVoices() {
    const updateVoices = () => {
      this.voices = this.synthesis.getVoices()
      // Prefer Hindi voices, then female voices, then any available
      const hindiVoices = this.voices.filter((v) => v.lang.startsWith("hi"))
      const femaleVoices = this.voices.filter((v) => v.name.toLowerCase().includes("female"))
      const preferredVoice = hindiVoices[0] || femaleVoices[0] || this.voices[0]
      if (preferredVoice && !this.settings.voice) {
        this.settings.voice = preferredVoice.name
      }
    }

    updateVoices()
    if (this.voices.length === 0) {
      this.synthesis.onvoiceschanged = updateVoices
    }
  }

  updateSettings(newSettings: Partial<VoiceSettings>) {
    this.settings = { ...this.settings, ...newSettings }
  }

  setCallbacks(onStart?: () => void, onEnd?: () => void, onError?: () => void) {
    this.onStart = onStart
    this.onEnd = onEnd
    this.onError = onError
  }

  // Enhanced text preprocessing for grandmother-style narration
  private preprocessText(text: string): string {
    return (
      text
        // Add pauses after emotional expressions
        .replace(/(अरे वाह|ओह हो|क्या बात है|देखो तो)!/g, "$1! ")
        // Add longer pauses after questions
        .replace(/\?/g, "? ")
        // Add pauses after sentences
        .replace(/\./g, ". ")
        // Emphasize child's name
        .replace(new RegExp(`\\b${this.settings.voice}\\b`, "g"), `${this.settings.voice}`)
        // Add breathing pauses
        .replace(/,/g, ", ")
    )
  }

  // Split long text into manageable chunks
  private chunkText(text: string, maxLength = 200): string[] {
    const sentences = text.split(/[।.!?]+/).filter((s) => s.trim())
    const chunks: string[] = []
    let currentChunk = ""

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxLength && currentChunk) {
        chunks.push(currentChunk.trim())
        currentChunk = sentence
      } else {
        currentChunk += (currentChunk ? " " : "") + sentence
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim())
    }

    return chunks
  }

  async speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.stop()

      const processedText = this.preprocessText(text)
      const chunks = this.chunkText(processedText)
      let currentChunkIndex = 0

      const speakChunk = () => {
        if (currentChunkIndex >= chunks.length) {
          this.onEnd?.()
          resolve()
          return
        }

        const chunk = chunks[currentChunkIndex]
        const utterance = new SpeechSynthesisUtterance(chunk)

        // Find the selected voice
        const selectedVoice = this.voices.find((v) => v.name === this.settings.voice)
        if (selectedVoice) {
          utterance.voice = selectedVoice
        }

        utterance.rate = this.settings.rate
        utterance.pitch = this.settings.pitch
        utterance.volume = this.settings.volume
        utterance.lang = this.settings.language

        utterance.onstart = () => {
          if (currentChunkIndex === 0) {
            this.onStart?.()
          }
        }

        utterance.onend = () => {
          currentChunkIndex++
          // Add a small pause between chunks for natural flow
          setTimeout(speakChunk, 300)
        }

        utterance.onerror = (event) => {
          console.error("Speech synthesis error:", event)
          this.onError?.()
          reject(event)
        }

        this.currentUtterance = utterance
        this.synthesis.speak(utterance)
      }

      speakChunk()
    })
  }

  pause() {
    this.synthesis.pause()
  }

  resume() {
    this.synthesis.resume()
  }

  stop() {
    this.synthesis.cancel()
    this.currentUtterance = null
  }

  isPaused(): boolean {
    return this.synthesis.paused
  }

  isSpeaking(): boolean {
    return this.synthesis.speaking
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices
  }

  getCurrentSettings(): VoiceSettings {
    return { ...this.settings }
  }
}

export default function StoryPlayer({ category, customThemes, user, onBack, onUpdateUser }: StoryPlayerProps) {
  const [story, setStory] = useState("")
  const [storyTitle, setStoryTitle] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [screenOff, setScreenOff] = useState(false)
  const [volume, setVolume] = useState([80])
  const [isMuted, setIsMuted] = useState(false)
  const [currentStoryId, setCurrentStoryId] = useState("")
  const [showVoiceSettings, setShowVoiceSettings] = useState(false)
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    rate: 0.7,
    pitch: 1.2,
    volume: 0.8,
    voice: "",
    language: "hi-IN",
  })

  const ttsEngineRef = useRef<GrandmaTTSEngine | null>(null)

  useEffect(() => {
    // Initialize TTS Engine
    if (typeof window !== "undefined") {
      ttsEngineRef.current = new GrandmaTTSEngine()
      ttsEngineRef.current.setCallbacks(
        () => {
          setIsPlaying(true)
          setIsPaused(false)
        },
        () => {
          setIsPlaying(false)
          setIsPaused(false)
          addToHistory()
        },
        () => {
          setIsPlaying(false)
          setIsPaused(false)
        },
      )

      // Update voice settings
      const savedSettings = localStorage.getItem("grandmaVoiceSettings")
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        setVoiceSettings(settings)
        ttsEngineRef.current.updateSettings(settings)
      }
    }

    generateStory()

    return () => {
      ttsEngineRef.current?.stop()
    }
  }, [category, customThemes, user.name])

  useEffect(() => {
    const storyId = `${category}-${Date.now()}`
    setCurrentStoryId(storyId)
    setIsFavorite(user.favorites.includes(storyId))
  }, [story])

  useEffect(() => {
    // Update TTS settings when voice settings change
    if (ttsEngineRef.current) {
      const updatedSettings = {
        ...voiceSettings,
        volume: isMuted ? 0 : volume[0] / 100,
      }
      ttsEngineRef.current.updateSettings(updatedSettings)
      localStorage.setItem("grandmaVoiceSettings", JSON.stringify(voiceSettings))
    }
  }, [voiceSettings, volume, isMuted])

  const generateStory = async () => {
    setIsLoading(true)
    try {
      let prompt = ""
      const system = `आप एक बहुत प्यारी और अनुभवी दादी हैं जो बच्चों को कहानियां सुनाती हैं। आपकी आवाज़ में गर्मजोशी, प्रेम और स्नेह है। आप कहानी इस तरह सुनाती हैं:

- "बेटा", "मेरे प्यारे बच्चे", "सोने जा" जैसे प्रेम भरे संबोधन का उपयोग करती हैं
- कहानी को रोचक बनाने के लिए "अरे वाह!", "ओह हो!", "क्या बात है!", "देखो तो!" जैसे भाव भरे शब्द इस्तेमाल करती हैं
- बीच-बीच में बच्चे से सवाल पूछती हैं जैसे "तुम्हें क्या लगता है फिर क्या हुआ होगा?"
- कहानी के अंत में हमेशा एक अच्छी सीख देती हैं और "अब सो जाओ मेरे प्यारे" जैसे प्रेम भरे शब्द कहती हैं
- सरल, सुंदर हिंदी का प्रयोग करती हैं
- कहानी 400-600 शब्दों की होती है (लंबी और विस्तृत)
- हर कहानी "एक बार की बात है" से शुरू होती है
- कहानी में संवाद, भावनाएं और विस्तार से वर्णन होता है`

      if (category === "custom" && customThemes) {
        prompt = `मेरे प्यारे बच्चे ${user.name} के लिए एक लंबी और मज़ेदार कहानी सुनाएं जिसमें ये चीज़ें हों: ${customThemes}। ${user.name} इस कहानी का मुख्य किरदार है। कहानी में रोमांच, दोस्ती, खुशी और थोड़ा सा रहस्य हो। कहानी को विस्तार से बताएं और अंत में एक प्यारी सी सीख भी दें।`
      } else {
        const categoryPrompts: Record<string, string> = {
          "raja-rani": `मेरे राजकुमार/राजकुमारी ${user.name} के लिए एक शानदार और लंबी राजा-रानी की कहानी सुनाएं। इसमें एक सुंदर महल, जादुई चीज़ें, बहादुरी, और दयालुता की सीख हो। कहानी में संवाद और रोमांच भी हो।`,
          pariyon: `मेरे प्यारे ${user.name} के लिए परियों की एक जादुई और लंबी कहानी सुनाएं। इसमें रंग-बिरंगी परियां, जादू, उड़ना, और सच्ची दोस्ती की सीख हो। कहानी में जादुई जंगल और खूबसूरत महल भी हो।`,
          jungle: `मेरे बहादुर ${user.name} के लिए जंगल की एक रोमांचक और लंबी कहानी सुनाएं। इसमें जंगली जानवर, साहसिक यात्रा, छुपे हुए खजाने, और प्रकृति से प्रेम की सीख हो।`,
          janwar: `मेरे प्यारे ${user.name} के लिए जानवरों की एक मज़ेदार और लंबी कहानी सुनाएं। इसमें प्यारे जानवर, उनकी शरारतें, दोस्ती, और दया-करुणा की सीख हो।`,
          mystery: `मेरे होशियार ${user.name} के लिए एक रहस्यमय और दिलचस्प कहानी सुनाएं। इसमें एक छोटा सा रहस्य, खोज, सुराग, और समझदारी की सीख हो। कहानी डरावनी नहीं बल्कि रोचक हो।`,
          moral: `मेरे अच्छे बच्चे ${user.name} के लिए एक नैतिक और लंबी कहानी सुनाएं जो ईमानदारी, सच्चाई, या अच्छे व्यवहार की सीख देती हो।`,
          festival: `मेरे खुशमिज़ाज ${user.name} के लिए त्योहार की एक रंगीन और लंबी कहानी सुनाएं। इसमें खुशी, उत्सव, रंग, मिठाई, और साझा करने की सीख हो।`,
          bedtime: `मेरे प्यारे ${user.name} के लिए सोने के समय की एक शांत और लंबी कहानी सुनाएं। इसमें चांद, तारे, मीठे सपने, और प्रेम की गर्मजोशी हो।`,
        }
        prompt = categoryPrompts[category] || categoryPrompts["moral"]
      }

      const res = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, system }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "कहानी बनाने में समस्या हुई")
      }

      const data = (await res.json()) as { text: string }
      setStory(data.text)

      // Extract title from story
      const lines = data.text.split("\n").filter((l) => l.trim())
      const firstLine = lines[0] || ""

      let title = ""
      if (firstLine.includes("एक बार की बात है")) {
        const titleMatch = data.text.match(/(?:एक बार की बात है[^।]*।\s*)([^।\n]+)/)
        title = titleMatch?.[1]?.trim() || `${categoryNames[category]} - ${user.name}`
      } else {
        title = firstLine.length < 60 ? firstLine : `${categoryNames[category]} - ${user.name}`
      }

      setStoryTitle(title)
    } catch (err: any) {
      console.error("Story generation error:", err)
      setStory(`अरे बेटा, दादी को कहानी बनाने में थोड़ी सी समस्या हो रही है। 

कोई बात नहीं, थोड़ा सा इंतज़ार करके दोबारा कोशिश करते हैं। दादी आपके लिए बहुत सुंदर कहानी लेकर आएंगी!

💝 दादी का प्यार हमेशा आपके साथ है।`)
      setStoryTitle("दादी की प्यारी कहानी")
    } finally {
      setIsLoading(false)
    }
  }

  const togglePlayPause = async () => {
    if (!ttsEngineRef.current) return

    if (isPlaying) {
      if (isPaused) {
        ttsEngineRef.current.resume()
        setIsPaused(false)
      } else {
        ttsEngineRef.current.pause()
        setIsPaused(true)
      }
    } else {
      try {
        await ttsEngineRef.current.speak(story)
      } catch (error) {
        console.error("TTS Error:", error)
        setIsPlaying(false)
      }
    }
  }

  const stopStory = () => {
    if (ttsEngineRef.current) {
      ttsEngineRef.current.stop()
      setIsPlaying(false)
      setIsPaused(false)
    }
  }

  const addToHistory = () => {
    const historyItem = {
      id: currentStoryId,
      title: storyTitle,
      category: categoryNames[category],
      timestamp: Date.now(),
    }

    const updatedUser = {
      ...user,
      history: [historyItem, ...user.history.slice(0, 19)],
    }

    onUpdateUser(updatedUser)
  }

  const toggleFavorite = () => {
    const updatedFavorites = isFavorite
      ? user.favorites.filter((id) => id !== currentStoryId)
      : [...user.favorites, currentStoryId]

    const updatedUser = { ...user, favorites: updatedFavorites }
    onUpdateUser(updatedUser)
    setIsFavorite(!isFavorite)
  }

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const updateVoiceSetting = (key: keyof VoiceSettings, value: any) => {
    setVoiceSettings((prev) => ({ ...prev, [key]: value }))
  }

  const getAvailableVoices = () => {
    return ttsEngineRef.current?.getAvailableVoices() || []
  }

  if (screenOff) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-md">
          <div className="text-8xl mb-6 animate-pulse">🌙</div>
          <h2 className="text-2xl font-bold mb-4">स्क्रीन बंद है</h2>
          <p className="text-lg mb-2">दादी की कहानी सुनते रहें...</p>
          <p className="text-sm text-gray-300 mb-8">आंखों को आराम दें और कल्पना की दुनिया में खो जाएं</p>
          <div className="space-y-4">
            <Button
              onClick={() => setScreenOff(false)}
              variant="outline"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm"
            >
              <Monitor className="w-4 h-4 mr-2" />
              स्क्रीन चालू करें
            </Button>
            {isPlaying && (
              <Button
                onClick={togglePlayPause}
                variant="outline"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm"
              >
                {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                {isPaused ? "चालू करें" : "रोकें"}
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Button variant="ghost" onClick={onBack} className="text-gray-700 hover:text-purple-600 hover:bg-purple-50">
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">वापस</span>
            </Button>

            <div className="text-center flex-1 mx-4">
              <h1 className="font-bold text-gray-800 text-lg sm:text-xl">{categoryNames[category]}</h1>
              <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <span className="text-lg">👵</span>
                <Mic className="w-4 h-4" />
                उन्नत आवाज़ तकनीक के साथ
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                className="text-gray-700 hover:text-purple-600 hover:bg-purple-50"
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => setScreenOff(true)}
                className="text-gray-700 hover:text-purple-600 hover:bg-purple-50"
              >
                <MonitorOff className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Voice Settings Panel */}
        {showVoiceSettings && (
          <Card className="mb-6 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                आवाज़ की सेटिंग्स
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">आवाज़ चुनें</label>
                  <Select value={voiceSettings.voice} onValueChange={(value) => updateVoiceSetting("voice", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="आवाज़ चुनें" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableVoices().map((voice) => (
                        <SelectItem key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    गति: {voiceSettings.rate.toFixed(1)}x
                  </label>
                  <Slider
                    value={[voiceSettings.rate]}
                    onValueChange={([value]) => updateVoiceSetting("rate", value)}
                    min={0.3}
                    max={2.0}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    आवाज़ की ऊंचाई: {voiceSettings.pitch.toFixed(1)}
                  </label>
                  <Slider
                    value={[voiceSettings.pitch]}
                    onValueChange={([value]) => updateVoiceSetting("pitch", value)}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">भाषा</label>
                  <Select
                    value={voiceSettings.language}
                    onValueChange={(value) => updateVoiceSetting("language", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hi-IN">हिंदी (भारत)</SelectItem>
                      <SelectItem value="en-IN">अंग्रेजी (भारत)</SelectItem>
                      <SelectItem value="en-US">अंग्रेजी (अमेरिका)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Story Card */}
        <Card className="mb-6 sm:mb-8 shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-6 sm:p-8">
            {isLoading ? (
              <div className="text-center py-12 sm:py-16">
                <div className="text-8xl mb-6 animate-bounce">👵</div>
                <Loader2 className="w-10 h-10 animate-spin mx-auto mb-6 text-pink-500" />
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                  दादी आपके लिए एक लंबी कहानी बना रही हैं...
                </h3>
                <p className="text-gray-600 mb-2">कृपया थोड़ा सा इंतज़ार करें, बहुत सुंदर कहानी आ रही है! 🌟</p>
                <p className="text-sm text-purple-600">उन्नत आवाज़ तकनीक तैयार हो रही है 🎙️</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex-1">{storyTitle}</h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleFavorite}
                      className={`${isFavorite ? "bg-red-100 text-red-600 border-red-200" : "bg-white text-gray-600 border-gray-200"} hover:scale-105 transition-transform`}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                      <span className="hidden sm:inline ml-2">{isFavorite ? "पसंदीदा" : "पसंद"}</span>
                    </Button>
                  </div>
                </div>

                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                  {story.split("\n").map(
                    (paragraph, index) =>
                      paragraph.trim() && (
                        <p key={index} className="mb-4 text-base sm:text-lg">
                          {paragraph}
                        </p>
                      ),
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Audio Controls */}
        {!isLoading && (
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6 sm:p-8">
              {/* Status Indicator */}
              <div className="text-center mb-4">
                <span className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-blue-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                  <Mic className="w-4 h-4" />
                  {isPlaying ? (isPaused ? "रुकी हुई है" : "चल रही है") : "तैयार है"}- उन्नत आवाज़ तकनीक
                </span>
              </div>

              {/* Main Controls */}
              <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6 sm:mb-8">
                <Button
                  onClick={togglePlayPause}
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white rounded-full w-16 h-16 sm:w-20 sm:h-20 shadow-2xl transform transition-all duration-200 hover:scale-110"
                >
                  {isPlaying && !isPaused ? (
                    <Pause className="w-6 h-6 sm:w-8 sm:h-8" />
                  ) : (
                    <Play className="w-6 h-6 sm:w-8 sm:h-8" />
                  )}
                </Button>

                {isPlaying && (
                  <Button
                    onClick={stopStory}
                    variant="outline"
                    className="bg-white text-red-600 border-red-200 hover:bg-red-50 px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                  >
                    रोकें
                  </Button>
                )}

                <Button
                  onClick={generateStory}
                  variant="outline"
                  className="bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                  disabled={isLoading}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">नई कहानी</span>
                  <span className="sm:hidden">नई</span>
                </Button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-3 sm:gap-4 mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleMute}
                  className="bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>

                <div className="flex-1">
                  <Slider value={volume} onValueChange={handleVolumeChange} max={100} step={1} className="w-full" />
                </div>

                <span className="text-sm text-gray-600 w-12 text-center font-medium">
                  {isMuted ? "🔇" : `${volume[0]}%`}
                </span>
              </div>

              {/* Tips */}
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                  <span className="text-lg">🎧</span>
                  उन्नत आवाज़ तकनीक के साथ बेहतर अनुभव
                </p>
                <p className="text-xs text-gray-500">
                  आवाज़ की सेटिंग्स बदलने के लिए ⚙️ बटन दबाएं • दादी की आवाज़ को अपने अनुसार बनाएं
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
