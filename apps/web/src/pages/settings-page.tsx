import { type ReactNode } from "react"
import { Monitor, Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useTheme } from "@/components/theme-provider"

type ThemeOption = "light" | "dark" | "system"

const themeOptions: Array<{
  value: ThemeOption
  title: string
  description: string
  icon: ReactNode
}> = [
  {
    value: "light",
    title: "Light",
    description: "Bright and calm, great for daytime use.",
    icon: <Sun className="size-4" />,
  },
  {
    value: "dark",
    title: "Dark",
    description: "Gentle on the eyes for evening reading.",
    icon: <Moon className="size-4" />,
  },
  {
    value: "system",
    title: "Default",
    description: "Match your device appearance automatically.",
    icon: <Monitor className="size-4" />,
  },
]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Personalize your experience across Zarife.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>
            Choose a light or dark appearance, or follow your device settings.
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
                    {option.title}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {option.description}
                  </span>
                </span>
              </Button>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
