"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Heart, History, Settings, Edit2, Save, X } from "lucide-react"

interface UserProfileProps {
  user: {
    name: string
    favorites: string[]
    history: Array<{
      id: string
      title: string
      category: string
      timestamp: number
    }>
  }
  onBack: () => void
  onUpdateUser: (user: {
    name: string
    favorites: string[]
    history: Array<{
      id: string
      title: string
      category: string
      timestamp: number
    }>
  }) => void
}

export default function UserProfile({ user, onBack, onUpdateUser }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState(user.name)

  const handleSaveName = () => {
    if (newName.trim()) {
      onUpdateUser({ ...user, name: newName.trim() })
      setIsEditing(false)
    }
  }

  const clearHistory = () => {
    if (confirm("क्या आप वाकई अपनी सारी कहानियों का इतिहास मिटाना चाहते हैं?")) {
      onUpdateUser({ ...user, history: [] })
    }
  }

  const clearFavorites = () => {
    if (confirm("क्या आप वाकई अपनी सारी पसंदीदा कहानियां हटाना चाहते हैं?")) {
      onUpdateUser({ ...user, favorites: [] })
    }
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
          <h1 className="text-xl font-bold text-gray-800">प्रोफाइल</h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Profile Card */}
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4">👶</div>

            {isEditing ? (
              <div className="flex items-center justify-center gap-2 mb-4">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="text-center text-xl font-bold max-w-xs"
                  onKeyPress={(e) => e.key === "Enter" && handleSaveName()}
                />
                <Button onClick={handleSaveName} size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                  <Save className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false)
                    setNewName(user.name)
                  }}
                  size="sm"
                  variant="outline"
                  className="bg-white text-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                <Button
                  onClick={() => setIsEditing(true)}
                  size="sm"
                  variant="outline"
                  className="bg-white text-gray-700"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            )}

            <p className="text-gray-600">दादी की प्यारी कहानियों का मज़ा लें! 🌟</p>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-pink-100">
            <CardContent className="p-6 text-center">
              <Heart className="w-8 h-8 mx-auto mb-2 text-pink-600" />
              <h3 className="text-2xl font-bold text-gray-800">{user.favorites.length}</h3>
              <p className="text-gray-600">पसंदीदा कहानियां</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-100">
            <CardContent className="p-6 text-center">
              <History className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="text-2xl font-bold text-gray-800">{user.history.length}</h3>
              <p className="text-gray-600">सुनी गई कहानियां</p>
            </CardContent>
          </Card>
        </div>

        {/* Settings */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              सेटिंग्स
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-800">कहानियों का इतिहास</h4>
                  <p className="text-sm text-gray-600">सुनी गई सभी कहानियों की सूची मिटाएं</p>
                </div>
                <Button
                  onClick={clearHistory}
                  variant="outline"
                  className="bg-white text-red-600 border-red-200 hover:bg-red-50"
                  disabled={user.history.length === 0}
                >
                  मिटाएं
                </Button>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-800">पसंदीदा कहानियां</h4>
                  <p className="text-sm text-gray-600">सभी पसंदीदा कहानियां हटाएं</p>
                </div>
                <Button
                  onClick={clearFavorites}
                  variant="outline"
                  className="bg-white text-red-600 border-red-200 hover:bg-red-50"
                  disabled={user.favorites.length === 0}
                >
                  हटाएं
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="mt-6 bg-gradient-to-r from-yellow-200 to-orange-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">💡 टिप्स</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• 🎧 बेहतर अनुभव के लिए हेडफोन का इस्तेमाल करें</li>
              <li>• 🌙 सोने से पहले "सोने की कहानियां" सुनें</li>
              <li>• ❤️ अपनी पसंदीदा कहानियों को सेव करना न भूलें</li>
              <li>• 🎨 अपनी मनपसंद चीज़ों की कहानी बनवाएं</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
