"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Heart,
  Moon,
  Crown,
  Sparkles,
  TreePine,
  Dog,
  Gift,
  Mic,
  History,
  UserIcon,
  Menu,
  X,
  Search,
} from "lucide-react"
import StoryPlayer from "@/components/story-player"
import UserProfile from "@/components/user-profile"
import StoryHistory from "@/components/story-history"

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

const storyCategories = [
  {
    id: "raja-rani",
    name: "राजा रानी की कहानी",
    icon: Crown,
    gradient: "from-purple-400 to-pink-400",
    emoji: "👑",
    description: "महल और राजकुमारों की शानदार कहानियां",
  },
  {
    id: "pariyon",
    name: "परियों की कहानी",
    icon: Sparkles,
    gradient: "from-pink-400 to-rose-400",
    emoji: "🧚‍♀️",
    description: "जादुई परियों की मनमोहक कहानियां",
  },
  {
    id: "jungle",
    name: "जंगल एडवेंचर",
    icon: TreePine,
    gradient: "from-green-400 to-emerald-400",
    emoji: "🐯",
    description: "जंगल की रोमांचक और साहसिक यात्राएं",
  },
  {
    id: "janwar",
    name: "जानवरों की मस्ती",
    icon: Dog,
    gradient: "from-yellow-400 to-orange-400",
    emoji: "🐶",
    description: "प्यारे जानवरों की दोस्ती और मस्ती",
  },
  {
    id: "mystery",
    name: "रहस्यमय कहानियां",
    icon: Search,
    gradient: "from-indigo-400 to-purple-400",
    emoji: "🔍",
    description: "दिलचस्प रहस्य और खोज की कहानियां",
  },
  {
    id: "moral",
    name: "नैतिक कहानियां",
    icon: Heart,
    gradient: "from-red-400 to-pink-400",
    emoji: "✨",
    description: "अच्छी बातें सिखाने वाली प्रेरणादायक कहानियां",
  },
  {
    id: "festival",
    name: "त्योहार स्पेशल",
    icon: Gift,
    gradient: "from-orange-400 to-red-400",
    emoji: "🎉",
    description: "त्योहारों की खुशियों और उत्सव की कहानियां",
  },
  {
    id: "bedtime",
    name: "सोने की कहानियां",
    icon: Moon,
    gradient: "from-blue-400 to-indigo-400",
    emoji: "🌙",
    description: "मीठे सपनों के लिए शांत और प्यारी कहानियां",
  },
]

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [currentView, setCurrentView] = useState<"home" | "story" | "profile" | "history">("home")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [customThemes, setCustomThemes] = useState("")
  const [userName, setUserName] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const savedUser = localStorage.getItem("hindiStoryUser")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    } else {
      setShowLogin(true)
    }
  }, [])

  const handleLogin = () => {
    if (userName.trim()) {
      const newUser: User = {
        name: userName.trim(),
        favorites: [],
        history: [],
      }
      setUser(newUser)
      localStorage.setItem("hindiStoryUser", JSON.stringify(newUser))
      setShowLogin(false)
      setUserName("")
    }
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem("hindiStoryUser", JSON.stringify(updatedUser))
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setCurrentView("story")
    setMobileMenuOpen(false)
  }

  const handleCustomStory = () => {
    if (customThemes.trim()) {
      setSelectedCategory("custom")
      setCurrentView("story")
    }
  }

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="mb-8">
                <div className="text-8xl mb-6 animate-bounce">👵</div>
                <div className="w-24 h-1 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 mx-auto rounded-full mb-6"></div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                दादी की कहानियां
              </h1>
              <p className="text-gray-600 mb-2 text-lg">आपका नाम क्या है, बच्चे?</p>
              <p className="text-sm text-gray-500 mb-8">🎙️ अब AI आवाज़ के साथ और भी बेहतर अनुभव</p>

              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="अपना नाम लिखें..."
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="text-center text-lg py-4 border-2 border-pink-200 focus:border-pink-400 rounded-xl bg-white/80"
                  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                />
                <Button
                  onClick={handleLogin}
                  className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white text-lg py-4 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105"
                  disabled={!userName.trim()}
                >
                  कहानी सुनना शुरू करें 🎧
                </Button>
              </div>

              <div className="mt-8 text-sm text-gray-500 space-y-2">
                <p>🌟 व्यक्तिगत कहानियां • 🎙️ AI आवाज़ • 👶 बच्चों के लिए सुरक्षित</p>
                <p>📱 मोबाइल और डेस्कटॉप दोनों के लिए</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentView === "story") {
    return (
      <StoryPlayer
        category={selectedCategory}
        customThemes={customThemes}
        user={user!}
        onBack={() => {
          setCurrentView("home")
          setCustomThemes("")
        }}
        onUpdateUser={updateUser}
      />
    )
  }

  if (currentView === "profile") {
    return <UserProfile user={user!} onBack={() => setCurrentView("home")} onUpdateUser={updateUser} />
  }

  if (currentView === "history") {
    return (
      <StoryHistory
        user={user!}
        onBack={() => setCurrentView("home")}
        onPlayStory={(category) => {
          setSelectedCategory(category)
          setCurrentView("story")
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="text-4xl sm:text-5xl animate-pulse">👵</div>
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                  दादी की कहानियां
                </h1>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  नमस्ते {user?.name}! 🌟{" "}
                  <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">AI Voice</span>
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setCurrentView("history")}
                className="text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
              >
                <History className="w-5 h-5 mr-2" />
                इतिहास
              </Button>
              <Button
                variant="ghost"
                onClick={() => setCurrentView("profile")}
                className="text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
              >
                <UserIcon className="w-5 h-5 mr-2" />
                प्रोफाइल
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button variant="ghost" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-700">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-pink-100 bg-white/95 backdrop-blur-sm">
              <div className="space-y-2">
                <div className="px-4 py-2">
                  <p className="text-sm text-gray-600">नमस्ते {user?.name}! 🌟</p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setCurrentView("history")
                    setMobileMenuOpen(false)
                  }}
                  className="w-full justify-start text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                >
                  <History className="w-5 h-5 mr-2" />
                  कहानियों का इतिहास
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setCurrentView("profile")
                    setMobileMenuOpen(false)
                  }}
                  className="w-full justify-start text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                >
                  <UserIcon className="w-5 h-5 mr-2" />
                  प्रोफाइल
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* AI Voice Feature Banner */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white border-0 shadow-2xl">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">🎙️</span>
                <h2 className="text-xl font-bold">नई सुविधा: AI आवाज़ के साथ कहानियां!</h2>
              </div>
              <p className="text-sm opacity-90">अब दादी की आवाज़ और भी बेहतर और असली लगेगी</p>
            </CardContent>
          </Card>
        </div>

        {/* Custom Story Section */}
        <Card className="mb-8 shadow-xl border-0 bg-gradient-to-r from-purple-100 via-pink-100 to-indigo-100">
          <CardContent className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-500" />
                अपनी मनपसंद कहानी बनवाएं
              </h2>
              <p className="text-gray-700 text-sm sm:text-base">बताएं कि आप किस चीज़ की कहानी सुनना चाहते हैं</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <Input
                placeholder="जैसे: हाथी, गुब्बारे, समुद्र, चॉकलेट, रोबोट..."
                value={customThemes}
                onChange={(e) => setCustomThemes(e.target.value)}
                className="flex-1 text-center sm:text-left border-2 border-purple-200 focus:border-purple-400 rounded-xl py-3 bg-white/80"
              />
              <Button
                onClick={handleCustomStory}
                disabled={!customThemes.trim()}
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
              >
                <Mic className="w-4 h-4 mr-2" />
                कहानी बनाएं
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Story Categories */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">कहानी की जादुई दुनिया में आपका स्वागत है! 🌈</h2>
          <p className="text-gray-600 text-sm sm:text-base">अपनी पसंदीदा कहानी चुनें - अब AI आवाज़ के साथ</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {storyCategories.map((category) => {
            const IconComponent = category.icon
            return (
              <Card
                key={category.id}
                className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden"
                onClick={() => handleCategorySelect(category.id)}
              >
                <div className={`h-2 bg-gradient-to-r ${category.gradient}`}></div>
                <CardContent className="p-6 text-center">
                  <div className="text-5xl sm:text-6xl mb-4 group-hover:animate-bounce">{category.emoji}</div>
                  <h3 className="font-bold text-gray-800 mb-2 text-lg sm:text-xl">{category.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                  <div
                    className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-r ${category.gradient} flex items-center justify-center group-hover:rotate-12 transition-transform duration-300`}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  {category.id === "mystery" && (
                    <div className="mt-2">
                      <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">नया!</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Enhanced Features Section */}
        <div className="mt-12 sm:mt-16">
          <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-0 shadow-xl">
            <CardContent className="p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-6">दादी की खास बातें 💝</h3>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 text-center">
                <div className="space-y-2">
                  <div className="text-3xl">🎙️</div>
                  <p className="text-sm font-medium text-gray-700">AI आवाज़</p>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl">🎧</div>
                  <p className="text-sm font-medium text-gray-700">हेडफोन अनुभव</p>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl">🌙</div>
                  <p className="text-sm font-medium text-gray-700">सोने की कहानियां</p>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl">❤️</div>
                  <p className="text-sm font-medium text-gray-700">पसंदीदा सेव करें</p>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl">📱</div>
                  <p className="text-sm font-medium text-gray-700">स्क्रीन ऑफ मोड</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
