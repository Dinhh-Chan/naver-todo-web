"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react"
import { FirebaseService } from "@/lib/firebase-config"

export function SyncStatus() {
  const [syncStatus, setSyncStatus] = useState<"connected" | "disconnected" | "syncing" | "error">("disconnected")
  const [lastSync, setLastSync] = useState<Date | null>(null)

  useEffect(() => {
    // Check sync status
    const checkStatus = () => {
      // In a real implementation, this would check Firebase connection
      setSyncStatus("disconnected")
    }

    checkStatus()
    const interval = setInterval(checkStatus, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleSync = async () => {
    setSyncStatus("syncing")
    try {
      await FirebaseService.syncWithLocalStorage()
      setSyncStatus("connected")
      setLastSync(new Date())
    } catch (error) {
      setSyncStatus("error")
    }
  }

  const getStatusIcon = () => {
    switch (syncStatus) {
      case "connected":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "disconnected":
        return <CloudOff className="h-4 w-4 text-muted-foreground" />
      case "syncing":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-destructive" />
    }
  }

  const getStatusText = () => {
    switch (syncStatus) {
      case "connected":
        return "Đã đồng bộ"
      case "disconnected":
        return "Chưa kết nối"
      case "syncing":
        return "Đang đồng bộ..."
      case "error":
        return "Lỗi đồng bộ"
    }
  }

  const getStatusColor = () => {
    switch (syncStatus) {
      case "connected":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "disconnected":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      case "syncing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    }
  }

  return (
    <Card className="border-dashed">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cloud className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Đồng bộ dữ liệu</span>
                <Badge variant="secondary" className={`text-xs ${getStatusColor()}`}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon()}
                    {getStatusText()}
                  </div>
                </Badge>
              </div>
              {lastSync && (
                <p className="text-xs text-muted-foreground">
                  Lần cuối: {lastSync.toLocaleTimeString("vi-VN")}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncStatus === "syncing"}
            className="gap-2"
          >
            <RefreshCw className={`h-3 w-3 ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
            Đồng bộ
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

