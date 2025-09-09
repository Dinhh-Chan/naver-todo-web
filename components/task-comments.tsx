"use client"

import { useState } from "react"
import type { Task, TaskComment } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  MessageSquare, 
  Send, 
  AtSign,
  MoreVertical,
  Edit,
  Trash2
} from "lucide-react"
import { format } from "date-fns"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TaskCommentsProps {
  task: Task
  currentUser: string
  projectMembers: string[]
  onAddComment: (taskId: string, text: string, mentions?: string[]) => void
  onEditComment: (taskId: string, commentId: string, text: string) => void
  onDeleteComment: (taskId: string, commentId: string) => void
}

export function TaskComments({ 
  task, 
  currentUser, 
  projectMembers, 
  onAddComment, 
  onEditComment, 
  onDeleteComment 
}: TaskCommentsProps) {
  const [newComment, setNewComment] = useState("")
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editText, setEditText] = useState("")

  const handleAddComment = () => {
    if (!newComment.trim()) return

    // Extract mentions from comment text
    const mentionRegex = /@(\w+)/g
    const mentions: string[] = []
    let match
    while ((match = mentionRegex.exec(newComment)) !== null) {
      if (projectMembers.includes(match[1])) {
        mentions.push(match[1])
      }
    }

    onAddComment(task.id, newComment.trim(), mentions)
    setNewComment("")
  }

  const handleEditComment = (commentId: string, currentText: string) => {
    setEditingComment(commentId)
    setEditText(currentText)
  }

  const handleSaveEdit = () => {
    if (!editText.trim() || !editingComment) return

    onEditComment(task.id, editingComment, editText.trim())
    setEditingComment(null)
    setEditText("")
  }

  const handleCancelEdit = () => {
    setEditingComment(null)
    setEditText("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      if (editingComment) {
        handleSaveEdit()
      } else {
        handleAddComment()
      }
    }
  }

  const formatCommentText = (text: string) => {
    // Highlight mentions
    const mentionRegex = /@(\w+)/g
    const parts = text.split(mentionRegex)
    
    return parts.map((part, index) => {
      if (index % 2 === 1 && projectMembers.includes(part)) {
        return (
          <span key={index} className="bg-primary/10 text-primary px-1 rounded">
            @{part}
          </span>
        )
      }
      return part
    })
  }

  const getMemberAvatar = (username: string) => {
    return (
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">
          {username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({task.comments?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Comment */}
        <div className="space-y-3">
          <div className="flex gap-3">
            {getMemberAvatar(currentUser)}
            <div className="flex-1 space-y-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Add a comment... Use @username to mention someone"
                className="min-h-[80px] resize-none"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <AtSign className="h-3 w-3" />
                  <span>Press Ctrl+Enter to send</span>
                </div>
                <Button 
                  size="sm" 
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="gap-2"
                >
                  <Send className="h-3 w-3" />
                  Comment
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments List */}
        {task.comments && task.comments.length > 0 && (
          <div className="space-y-4">
            {task.comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                {getMemberAvatar(comment.username)}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{comment.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(comment.timestamp, "MMM d, yyyy 'at' h:mm a")}
                    </span>
                    {comment.username === currentUser && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleEditComment(comment.id, comment.text)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDeleteComment(task.id, comment.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  
                  {editingComment === comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="min-h-[60px] resize-none"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-foreground">
                      {formatCommentText(comment.text)}
                    </div>
                  )}

                  {comment.mentions && comment.mentions.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <AtSign className="h-3 w-3" />
                      <span>Mentioned: {comment.mentions.join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {(!task.comments || task.comments.length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No comments yet</p>
            <p className="text-xs">Be the first to add a comment</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
