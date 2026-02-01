import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Sparkles, Loader2, Languages, Volume2 } from "lucide-react"
import { useTranslation } from "react-i18next"

interface GeneratedStory {
  title: string
  text: string
  pages: string[]
}

export default function StoryGeneratorPage() {
  const { token } = useAuth()
  const { t } = useTranslation()
  const [topic, setTopic] = useState("")
  const [language, setLanguage] = useState("tr")
  const [ageMin, setAgeMin] = useState("4")
  const [ageMax, setAgeMax] = useState("8")
  const [educationalGoal, setEducationalGoal] = useState("")
  const [styleNotes, setStyleNotes] = useState("")

  const [generating, setGenerating] = useState(false)
  const [story, setStory] = useState<GeneratedStory | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [translating, setTranslating] = useState(false)
  const [translatedText, setTranslatedText] = useState<string | null>(null)
  const [targetLang, setTargetLang] = useState("en")

  const [ttsLoading, setTtsLoading] = useState(false)

  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:13000"

  const handleGenerate = async () => {
    if (!topic.trim()) return
    setGenerating(true)
    setError(null)
    setStory(null)
    setTranslatedText(null)

    try {
      const res = await fetch(`${apiBase}/api/AI/generate-story`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic,
          targetAgeMin: parseInt(ageMin),
          targetAgeMax: parseInt(ageMax),
          language,
          educationalGoal: educationalGoal || null,
          styleNotes: styleNotes || null,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to generate story")
      }

      const data = await res.json()
      setStory(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setGenerating(false)
    }
  }

  const handleTranslate = async () => {
    if (!story?.text) return
    setTranslating(true)
    try {
      const res = await fetch(`${apiBase}/api/AI/translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: story.text,
          sourceLanguage: language === "tr" ? "Turkish" : "English",
          targetLanguage: targetLang === "en" ? "English" : "Turkish",
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to translate")
      }

      const data = await res.json()
      setTranslatedText(data.translatedText)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Translation failed")
    } finally {
      setTranslating(false)
    }
  }

  const handleTts = async (text: string) => {
    setTtsLoading(true)
    try {
      const res = await fetch(`${apiBase}/api/AI/tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text, language }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "TTS failed")
      }

      const data = await res.json()
      if (data.audioBase64) {
        const audio = new Audio(`data:${data.contentType};base64,${data.audioBase64}`)
        audio.play()
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "TTS failed")
    } finally {
      setTtsLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('content.ai.title')}</h1>
        <p className="text-muted-foreground">
          {t('content.ai.description')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('content.ai.storyParams')}</CardTitle>
            <CardDescription>{t('content.ai.configureSettings')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">{t('content.ai.topic')}</Label>
              <Input
                id="topic"
                placeholder={t('content.ai.topicPlaceholder')}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('content.ai.language')}</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tr">{t('content.ai.turkish')}</SelectItem>
                    <SelectItem value="en">{t('content.ai.english')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>{t('content.ai.ageMin')}</Label>
                  <Input type="number" value={ageMin} onChange={(e) => setAgeMin(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('content.ai.ageMax')}</Label>
                  <Input type="number" value={ageMax} onChange={(e) => setAgeMax(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">{t('content.ai.educationalGoal')}</Label>
              <Input
                id="goal"
                placeholder={t('content.ai.educationalGoalPlaceholder')}
                value={educationalGoal}
                onChange={(e) => setEducationalGoal(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="style">{t('content.ai.styleNotes')}</Label>
              <Input
                id="style"
                placeholder={t('content.ai.styleNotesPlaceholder')}
                value={styleNotes}
                onChange={(e) => setStyleNotes(e.target.value)}
              />
            </div>

            <Button onClick={handleGenerate} disabled={generating || !topic.trim()} className="w-full">
              {generating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('content.ai.generating')}</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" /> {t('content.ai.generateStory')}</>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('content.ai.generatedStory')}</CardTitle>
            <CardDescription>
              {story ? story.title : t('content.ai.storyPlaceholder')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {generating && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {story && (
              <div className="space-y-4">
                <div className="max-h-[400px] space-y-3 overflow-y-auto rounded-lg border bg-muted/30 p-4">
                  {story.pages.map((page, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <p className="flex-1 text-sm leading-relaxed">{page}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        disabled={ttsLoading}
                        onClick={() => handleTts(page)}
                      >
                        <Volume2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Select value={targetLang} onValueChange={setTargetLang}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">{t('content.ai.english')}</SelectItem>
                      <SelectItem value="tr">{t('content.ai.turkish')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={handleTranslate} disabled={translating}>
                    {translating ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('content.ai.translating')}</>
                    ) : (
                      <><Languages className="mr-2 h-4 w-4" /> {t('content.ai.translate')}</>
                    )}
                  </Button>
                </div>

                {translatedText && (
                  <div className="max-h-[300px] overflow-y-auto rounded-lg border bg-muted/30 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{translatedText}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
