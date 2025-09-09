"use client"

import React, { useState, useRef } from "react"
import type { Project, ProjectDocument } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Plus,
  Search,
  ExternalLink,
  File,
  FileImage
} from "lucide-react"
// import { format } from "date-fns"

interface ProjectDocumentsProps {
  project: Project
}

export function ProjectDocuments({ project }: ProjectDocumentsProps) {
  const [documents, setDocuments] = useState<ProjectDocument[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [newDocument, setNewDocument] = useState({
    name: "",
    type: "file" as ProjectDocument["type"],
    url: "",
    description: "",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock documents for demonstration
  const mockDocuments: ProjectDocument[] = [
    {
      id: "1",
      name: "Project Requirements.pdf",
      type: "pdf",
      url: "#",
      size: 2048000,
      uploadedBy: "admin",
      uploadedAt: new Date(),
      description: "Detailed project requirements document",
      projectId: project.id,
    },
    {
      id: "2",
      name: "Design Mockups",
      type: "image",
      url: "#",
      size: 5120000,
      uploadedBy: "john_doe",
      uploadedAt: new Date(Date.now() - 86400000),
      description: "UI/UX design mockups",
      projectId: project.id,
    },
    {
      id: "3",
      name: "API Documentation",
      type: "link",
      url: "https://api-docs.example.com",
      uploadedBy: "jane_smith",
      uploadedAt: new Date(Date.now() - 172800000),
      description: "External API documentation link",
      projectId: project.id,
    },
  ]

  const [allDocuments] = useState<ProjectDocument[]>(mockDocuments)

  const filteredDocuments = allDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || doc.type === filterType
    return matchesSearch && matchesFilter
  })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const file = files[0]
      const newDoc: ProjectDocument = {
        id: crypto.randomUUID(),
        name: file.name,
        type: getFileType(file.type),
        url: URL.createObjectURL(file),
        size: file.size,
        uploadedBy: "current_user",
        uploadedAt: new Date(),
        description: "",
        projectId: project.id,
      }
      setDocuments(prev => [...prev, newDoc])
    }
  }

  const handleAddLink = () => {
    if (!newDocument.name || !newDocument.url) return

    const newDoc: ProjectDocument = {
      id: crypto.randomUUID(),
      name: newDocument.name,
      type: newDocument.type,
      url: newDocument.url,
      uploadedBy: "current_user",
      uploadedAt: new Date(),
      description: newDocument.description,
      projectId: project.id,
    }
    setDocuments(prev => [...prev, newDoc])
    setNewDocument({ name: "", type: "file", url: "", description: "" })
    setShowUploadDialog(false)
  }

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id))
  }

  const getFileType = (mimeType: string): ProjectDocument["type"] => {
    if (mimeType.startsWith("image/")) return "image"
    if (mimeType.includes("pdf")) return "pdf"
    if (mimeType.includes("text/") || mimeType.includes("document")) return "document"
    return "file"
  }

  const getFileIcon = (type: ProjectDocument["type"]) => {
    switch (type) {
      case "image": return <FileImage className="h-5 w-5 text-blue-500" />
      case "pdf": return <FileText className="h-5 w-5 text-red-500" />
      case "document": return <FileText className="h-5 w-5 text-green-500" />
      case "link": return <ExternalLink className="h-5 w-5 text-purple-500" />
      default: return <File className="h-5 w-5 text-gray-500" />
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ""
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      const newDoc: ProjectDocument = {
        id: crypto.randomUUID(),
        name: file.name,
        type: getFileType(file.type),
        url: URL.createObjectURL(file),
        size: file.size,
        uploadedBy: "current_user",
        uploadedAt: new Date(),
        description: "",
        projectId: project.id,
      }
      setDocuments(prev => [...prev, newDoc])
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tài liệu Dự án</h2>
          <p className="text-muted-foreground">Quản lý tài liệu và tài nguyên của dự án</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Thêm tài liệu
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm tài liệu mới</DialogTitle>
                <DialogDescription>
                  Upload file hoặc thêm link tài liệu cho dự án
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="doc-name">Tên tài liệu</Label>
                  <Input
                    id="doc-name"
                    value={newDocument.name}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nhập tên tài liệu..."
                  />
                </div>
                <div>
                  <Label htmlFor="doc-type">Loại tài liệu</Label>
                  <select
                    id="doc-type"
                    value={newDocument.type}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, type: e.target.value as ProjectDocument["type"] }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="file">File</option>
                    <option value="link">Link</option>
                    <option value="image">Hình ảnh</option>
                    <option value="pdf">PDF</option>
                    <option value="document">Document</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="doc-url">URL hoặc Link</Label>
                  <Input
                    id="doc-url"
                    value={newDocument.url}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com/document.pdf"
                  />
                </div>
                <div>
                  <Label htmlFor="doc-description">Mô tả</Label>
                  <Textarea
                    id="doc-description"
                    value={newDocument.description}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Mô tả ngắn về tài liệu..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleAddLink} disabled={!newDocument.name || !newDocument.url}>
                    Thêm tài liệu
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm tài liệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="p-2 border rounded-md"
        >
          <option value="all">Tất cả</option>
          <option value="file">File</option>
          <option value="link">Link</option>
          <option value="image">Hình ảnh</option>
          <option value="pdf">PDF</option>
          <option value="document">Document</option>
        </select>
      </div>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-8">
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Upload tài liệu</h3>
            <p className="text-muted-foreground mb-4">
              Kéo thả file vào đây hoặc click để chọn file
            </p>
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Chọn file
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              multiple
            />
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((doc) => (
          <Card key={doc.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  {getFileIcon(doc.type)}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{doc.name}</h3>
                    {doc.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {doc.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {doc.type}
                      </Badge>
                      {doc.size && (
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(doc.size)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>by {doc.uploadedBy}</span>
                      <span>•</span>
                      <span>{doc.uploadedAt.toLocaleDateString('vi-VN', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="p-1 h-auto">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-1 h-auto text-destructive hover:text-destructive"
                    onClick={() => handleDeleteDocument(doc.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="rounded-full bg-muted p-4 w-fit mx-auto">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? "Không tìm thấy tài liệu" : "Chưa có tài liệu nào"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? "Thử tìm kiếm với từ khóa khác"
                    : "Bắt đầu bằng cách upload tài liệu đầu tiên"
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowUploadDialog(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Thêm tài liệu đầu tiên
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Tài nguyên quan trọng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <ExternalLink className="h-5 w-5 text-blue-500" />
              <div className="flex-1">
                <h4 className="font-medium">Gmail Integration</h4>
                <p className="text-sm text-muted-foreground">Sync email attachments to project</p>
              </div>
              <Button variant="outline" size="sm">
                Connect
              </Button>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <ExternalLink className="h-5 w-5 text-purple-500" />
              <div className="flex-1">
                <h4 className="font-medium">Slack Integration</h4>
                <p className="text-sm text-muted-foreground">Share documents in Slack channels</p>
              </div>
              <Button variant="outline" size="sm">
                Connect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
