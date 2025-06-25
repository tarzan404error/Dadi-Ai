"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play, Clock, Heart } from "lucide-react"

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

interface StoryHistoryProps {
  user: User
  onBack: () => void
  onPlayStory: (category: string) => void
}

export default function StoryHistory({ user, onBack, onPlayStory }: StoryHistoryProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "आज"
    if (diffDays === 2) return "कल"
    if (diffDays <= 7) return `${diffDays - 1} दिन पहले`

    return date.toLocaleDateString("hi-IN")
  }

  const getCategoryId = (categoryName: string): string => {
    const categoryMap: Record<string, string> = {
      "राजा रानी की कहानी": "raja-rani",
      "परियों की कहानी": "pariyon",
      "जंगल एडवेंचर": "jungle",
      "जानवरों की मस्ती": "janwar",
      "नैतिक कहानियां": "moral",
      "त्योहार स्पेशल": "festival",
      "सोने की कहानियां": "bedtime",
      "आपकी खास कहानी": "custom",
    }
    return categoryMap[categoryName] || "moral"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Button variant="outline" onClick={onBack} className="bg-white text-gray-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            वापस
          </Button>
          <h1 className="text-xl font-bold text-gray-800">कहानियों का इतिहास</h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {user.history.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">अभी तक कोई कहानी नहीं सुनी</h2>
              <p className="text-gray-600 mb-6">जब आप कहानियां सुनेंगे, तो वे यहां दिखाई देंगी</p>
              <Button onClick={onBack} className="bg-pink-500 hover:bg-pink-600 text-white">
                कहानी सुनना शुरू करें
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-2">आपने {user.history.length} कहानियां सुनी हैं 🎉</h2>
              <p className="text-gray-600">अपनी पसंदीदा कहानी दोबारा सुनें</p>
            </div>

            <div className="space-y-4">
              {user.history.map((story, index) => (
                <Card key={story.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-800 line-clamp-1">{story.title}</h3>
                          {user.favorites.includes(story.id) && <Heart className="w-4 h-4 text-red-500 fill-current" />}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{story.category}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {formatDate(story.timestamp)}
                        </div>
                      </div>

                      <Button
                        onClick={() => onPlayStory(getCategoryId(story.category))}
                        size="sm"
                        className="bg-pink-500 hover:bg-pink-600 text-white ml-4"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        सुनें
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {user.history.length >= 10 && (
              <Card className="mt-6 bg-gradient-to-r from-green-200 to-blue-200">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-2">🏆</div>
                  <h3 className="font-bold text-gray-800 mb-1">वाह! आप एक कहानी प्रेमी हैं!</h3>
                  <p className="text-sm text-gray-600">आपने {user.history.length} कहानियां सुनी हैं। बहुत बढ़िया!</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
