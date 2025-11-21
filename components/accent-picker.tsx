"use client"

import * as React from "react"
import { Check, Palette } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const themes = [
  { name: "Zinc", class: "", color: "bg-zinc-900 dark:bg-zinc-100" },
  { name: "Blue", class: "theme-blue", color: "bg-blue-600" },
  { name: "Green", class: "theme-green", color: "bg-green-600" },
  { name: "Orange", class: "theme-orange", color: "bg-orange-600" },
]

export function AccentPicker() {
  const [mounted, setMounted] = React.useState(false)
  const [currentTheme, setCurrentTheme] = React.useState("")

  React.useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("accent-theme") || ""
    setCurrentTheme(savedTheme)
    if (savedTheme) {
        document.body.classList.add(savedTheme)
    }
  }, [])

  const setTheme = (themeClass: string) => {
    // Remove all theme classes
    themes.forEach((t) => {
        if (t.class) document.body.classList.remove(t.class)
    })
    
    if (themeClass) {
        document.body.classList.add(themeClass)
    }
    
    setCurrentTheme(themeClass)
    localStorage.setItem("accent-theme", themeClass)
  }

  if (!mounted) {
    return (
      <Button variant="outline" size="icon">
        <Palette className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((theme) => (
            <DropdownMenuItem key={theme.name} onClick={() => setTheme(theme.class)}>
                <div className="flex items-center gap-2 w-full">
                    <div className={`h-4 w-4 rounded-full border ${theme.color}`}></div>
                    <span>{theme.name}</span>
                    {currentTheme === theme.class && <Check className="ml-auto h-4 w-4" />}
                </div>
            </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
