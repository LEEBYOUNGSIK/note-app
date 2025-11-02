"use client"

import { useEffect, useState, useCallback } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Save, Loader2, CheckCircle2, Circle, PlayCircle, Clock, Square, Pause, Check } from "lucide-react"
import type { Note } from "@/app/page"
import { cn } from "@/lib/utils"

interface EditorProps {
  note: Note
  onUpdate: (updates: Partial<Note>) => void
  onSave?: (updates: Partial<Note>) => void
  onSaveStatusChange?: (isSaving: boolean) => void
  isSaving?: boolean
}

export function Editor({ note, onUpdate, onSave, onSaveStatusChange, isSaving = false }: EditorProps) {
  const [title, setTitle] = useState(note.title || "")
  const [content, setContent] = useState(note.content)
  const [priority, setPriority] = useState(note.priority ?? 1)
  const [status, setStatus] = useState<"not_started" | "in_progress" | "completed" | "on_hold">(note.status ?? "not_started")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    setTitle(note.title || "")
    setContent(note.content)
    setPriority(note.priority ?? 1)
    setStatus(note.status ?? "not_started")
    setErrorMessage("")
  }, [note.id])

  // 즉시 UI 업데이트만 수행 (저장 안함)
  const handleTitleChange = (value: string) => {
    setTitle(value)
    onUpdate({ title: value })
  }

  const handleContentChange = (value: string) => {
    setContent(value)
    onUpdate({ content: value })
  }

  const handlePriorityChange = (value: number) => {
    setPriority(value)
    onUpdate({ priority: value })
  }

  const handleStatusChange = (value: "not_started" | "in_progress" | "completed" | "on_hold") => {
    setStatus(value)
    onUpdate({ status: value })
    // 진행상태 변경 시 즉시 저장하지 않음 (Save 버튼을 눌러야 저장됨)
  }

  // 수동 저장 함수 (Ctrl+S 또는 수동 호출)
  const handleManualSave = useCallback(async () => {
    // 타이틀과 내용이 모두 비어있는지 확인
    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()
    
    if (!trimmedTitle && !trimmedContent) {
      setErrorMessage("타이틀이나 내용 중 하나 이상 입력해주세요.")
      setTimeout(() => setErrorMessage(""), 3000)
      return
    }
    
        setErrorMessage("")
        if (onSave) {
          try {
            await onSave({ title: trimmedTitle, content: trimmedContent, priority, status })
          } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "저장 중 오류가 발생했습니다.")
            setTimeout(() => setErrorMessage(""), 3000)
          }
        }
      }, [title, content, priority, status, onSave])

  // Ctrl+S 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        handleManualSave()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleManualSave])

  return (
    <div className="flex-1 overflow-auto">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 md:px-8 py-6 md:py-12">
        <div className="flex items-center justify-between gap-4 mb-4">
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter your title..."
            className={cn(
              "flex-1 border-0 bg-transparent text-3xl sm:text-4xl md:text-5xl font-bold",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "px-0 placeholder:text-muted-foreground/50",
              "h-auto min-h-[3rem] leading-tight",
            )}
          />
          <Button
            onClick={handleManualSave}
            disabled={isSaving || !onSave}
            className="shrink-0"
            size="sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">Save</span>
              </>
            )}
          </Button>
        </div>
        {errorMessage && (
          <div className="mb-4 px-4 py-2 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">
            {errorMessage}
          </div>
        )}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {[
              { value: "not_started" as const, label: "대기", icon: Square, selectedColor: "text-gray-600 fill-gray-600", unselectedColor: "text-gray-400 fill-gray-400" },
              { value: "in_progress" as const, label: "진행중", icon: PlayCircle, selectedColor: "text-blue-400 fill-blue-400", unselectedColor: "text-blue-300 fill-blue-300" },
              { value: "completed" as const, label: "완료", icon: CheckCircle2, selectedColor: "text-green-600 fill-green-600", unselectedColor: "text-green-400 fill-green-400" },
              { value: "on_hold" as const, label: "보류", icon: Pause, selectedColor: "text-gray-600", unselectedColor: "text-gray-400" },
            ].map((item) => {
              const Icon = item.icon
              const isSelected = status === item.value
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleStatusChange(item.value)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                    isSelected
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-background"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isSelected ? item.selectedColor : item.unselectedColor)} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {[
              { value: 3, label: "긴급", selectedColor: "bg-red-500 text-white", unselectedColor: "hover:bg-red-50" },
              { value: 2, label: "주요", selectedColor: "bg-orange-500 text-white", unselectedColor: "hover:bg-orange-50" },
              { value: 1, label: "일반", selectedColor: "bg-blue-500 text-white", unselectedColor: "hover:bg-blue-50" },
              { value: 0, label: "낮음", selectedColor: "bg-gray-400 text-white", unselectedColor: "hover:bg-gray-100" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => handlePriorityChange(item.value)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                  priority === item.value
                    ? item.selectedColor
                    : `${item.unselectedColor} text-muted-foreground`
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <Textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Enter your content..."
          className={cn(
            "min-h-[calc(100vh-12rem)] resize-none border-0 bg-transparent",
            "text-lg sm:text-xl md:text-2xl leading-relaxed",
            "focus-visible:ring-0 focus-visible:ring-offset-0",
            "px-0 placeholder:text-muted-foreground/50",
          )}
        />
      </div>
    </div>
  )
}
