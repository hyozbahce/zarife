import { type ReactNode } from "react"
import { Monitor, Moon, Sun, Languages } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useTheme } from "@/components/theme-provider"
import { useTranslation } from "react-i18next"

type ThemeOption = "light" | "dark" | "system"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { t, i18n } = useTranslation()

  const themeOptions: Array<{
    value: ThemeOption
    titleKey: string
    descKey: string
    icon: ReactNode
  }> = [
    {
      value: "light",
      titleKey: "settings.theme.light",
      descKey: "settings.theme.lightDesc",
      icon: <Sun className="size-4" />,
    },
    {
      value: "dark",
      titleKey: "settings.theme.dark",
      descKey: "settings.theme.darkDesc",
      icon: <Moon className="size-4" />,
    },
    {
      value: "system",
      titleKey: "settings.theme.system",
      descKey: "settings.theme.systemDesc",
      icon: <Monitor className="size-4" />,
    },
  ]

  const languageOptions: Array<{
    value: string
    label: string
  }> = [
    { value: "en", label: t('settings.language.en') },
    { value: "tr", label: t('settings.language.tr') },
  ]

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('settings.title')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('settings.description')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.theme.title')}</CardTitle>
          <CardDescription>
            {t('settings.theme.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          {themeOptions.map((option) => {
            const isActive = theme === option.value
            return (
              <Button
                key={option.value}
                type="button"
                variant={isActive ? "secondary" : "outline"}
                className="h-auto flex-1 items-start justify-start gap-3 px-4 py-3 text-left"
                onClick={() => setTheme(option.value)}
              >
                <span className="mt-0.5 text-muted-foreground">
                  {option.icon}
                </span>
                <span className="space-y-1">
                  <span className="block text-sm font-semibold text-foreground">
                    {t(option.titleKey)}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {t(option.descKey)}
                  </span>
                </span>
              </Button>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="size-5" />
            {t('settings.language.title')}
          </CardTitle>
          <CardDescription>
            {t('settings.language.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          {languageOptions.map((option) => {
            const isActive = i18n.language === option.value
            return (
              <Button
                key={option.value}
                type="button"
                variant={isActive ? "secondary" : "outline"}
                className="h-auto flex-1 items-center justify-center gap-2 px-4 py-3"
                onClick={() => i18n.changeLanguage(option.value)}
              >
                <span className="text-sm font-semibold text-foreground">
                  {option.label}
                </span>
              </Button>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
