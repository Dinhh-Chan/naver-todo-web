"use client"

import type { Task } from "@/lib/types"
import { IntegrationsPanel as BaseIntegrationsPanel } from "@/components/integrations-panel"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Settings,
  ChevronDown,
  ChevronUp,
  Link,
  Zap
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface IntegrationsPanelProps {
  tasks: Task[]
  onAddTasks: (tasks: Task[]) => void
  isOpen: boolean
  onToggle: () => void
}

export function IntegrationsPanel({ tasks, onAddTasks, isOpen, onToggle }: IntegrationsPanelProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-between p-3 h-auto hover:bg-primary/5 transition-all duration-300 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Link className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="font-semibold text-foreground">Integrations</span>
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-emerald-500 animate-pulse" />
            </div>
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4">
        <Card className="border border-emerald-500/20 bg-gradient-to-br from-background/80 to-emerald-500/5 backdrop-blur-sm shadow-lg">
          <CardContent className="p-0">
            <BaseIntegrationsPanel tasks={tasks} onAddTasks={onAddTasks} />
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  )
}