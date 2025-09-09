"use client"

import { useState, useEffect } from "react"
import type { ViewMode } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Settings,
  ChevronDown,
  ChevronUp,
  Monitor,
  Sun,
  Moon,
  Globe,
  Bell,
  Clock,
  Palette,
  Eye
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface SettingsPanelProps {
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
  isOpen: boolean
  onToggle: () => void
}

export function SettingsPanel({ currentView, onViewChange, isOpen, onToggle }: SettingsPanelProps) {
  const [settings, setSettings] = useState({
    theme: "system",
    language: "en",
    notifications: true,
    timeFormat: "24h"
  })

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("anyf-settings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  // Save settings to localStorage
  const updateSettings = (newSettings: Partial<typeof settings>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    localStorage.setItem("anyf-settings", JSON.stringify(updated))
  }

  const viewOptions = [
    { value: "list", label: "List View", icon: "📋" },
    { value: "kanban", label: "Kanban Board", icon: "📋" },
    { value: "calendar", label: "Calendar", icon: "📅" },
    { value: "analytics", label: "Analytics", icon: "📊" },
    { value: "projects", label: "Projects", icon: "📁" }
  ]

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor }
  ]

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-between p-3 h-auto hover:bg-primary/5 transition-all duration-300 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-500/20 to-slate-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Settings className="h-4 w-4 text-gray-600" />
            </div>
            <span className="font-semibold text-foreground">Settings</span>
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 mt-4">
        <Card className="border border-gray-500/20 bg-gradient-to-br from-background/80 to-gray-500/5 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6 space-y-6">
            {/* View Mode */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
                <Eye className="h-4 w-4 text-blue-600" />
                View Mode
              </Label>
              <Select value={currentView} onValueChange={(value: ViewMode) => onViewChange(value)}>
                <SelectTrigger className="border-blue-300/50 focus-visible:ring-blue-400 bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-sm border-primary/20">
                  {viewOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        <span>{option.icon}</span>
                        {option.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Theme */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
                <Palette className="h-4 w-4 text-purple-600" />
                Theme
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map((option) => {
                  const Icon = option.icon
                  const isSelected = settings.theme === option.value
                  
                  return (
                    <Button
                      key={option.value}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSettings({ theme: option.value })}
                      className={`flex flex-col items-center gap-2 h-auto py-3 transition-all duration-300 ${
                        isSelected 
                          ? "bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg scale-105" 
                          : "hover:bg-primary/5 hover:border-primary/30"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-xs">{option.label}</span>
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Language */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
                <Globe className="h-4 w-4 text-green-600" />
                Language
              </Label>
              <Select value={settings.language} onValueChange={(value) => updateSettings({ language: value })}>
                <SelectTrigger className="border-green-300/50 focus-visible:ring-green-400 bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-sm border-primary/20">
                  <SelectItem value="en">
                    <span className="flex items-center gap-2">
                      🇺🇸 English
                    </span>
                  </SelectItem>
                  <SelectItem value="vi">
                    <span className="flex items-center gap-2">
                      🇻🇳 Tiếng Việt
                    </span>
                  </SelectItem>
                  <SelectItem value="es">
                    <span className="flex items-center gap-2">
                      🇪🇸 Español
                    </span>
                  </SelectItem>
                  <SelectItem value="fr">
                    <span className="flex items-center gap-2">
                      🇫🇷 Français
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Time Format */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
                <Clock className="h-4 w-4 text-amber-600" />
                Time Format
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {["12h", "24h"].map((format) => {
                  const isSelected = settings.timeFormat === format
                  
                  return (
                    <Button
                      key={format}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSettings({ timeFormat: format })}
                      className={`transition-all duration-300 ${
                        isSelected 
                          ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg scale-105" 
                          : "hover:bg-amber-50 hover:border-amber-300 dark:hover:bg-amber-950/20"
                      }`}
                    >
                      {format === "12h" ? "12 Hour" : "24 Hour"}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Notifications */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
                <Bell className="h-4 w-4 text-red-600" />
                Notifications
              </Label>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 rounded-lg border border-red-200/50 dark:border-red-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                    <Bell className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <Label htmlFor="notifications" className="text-sm font-medium cursor-pointer">
                      Enable Notifications
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Get notified about due dates and reminders
                    </p>
                  </div>
                </div>
                <Checkbox
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) => updateSettings({ notifications: !!checked })}
                  className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  )
}