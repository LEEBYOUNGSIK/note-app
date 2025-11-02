"use client"

import { FileText, Plus, Search, Trash2, X, Calendar, AlertCircle, AlertTriangle, Circle, CheckCircle2, CircleDot, ChevronDown, ChevronRight, GripVertical, Check, PlayCircle, Square, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { Note } from "@/app/page"
import { useState, useMemo, useEffect, useRef } from "react"

interface SidebarProps {
  notes: Note[]
  activeNoteId: string
  onSelectNote: (id: string) => void
  onCreateNote: () => void
  onDeleteNote: (id: string) => void
  isOpen: boolean
  onToggle: () => void
  resetKey?: string // 사이드바 초기화를 위한 키
}

export function Sidebar({ notes, activeNoteId, onSelectNote, onCreateNote, onDeleteNote, isOpen, onToggle, resetKey }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPriorities, setSelectedPriorities] = useState<Set<number>>(new Set())
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set())
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [sidebarWidth, setSidebarWidth] = useState(400) // 기본 너비 (px) - 320에서 400으로 증가
  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // resetKey가 변경되면 사이드바 상태 초기화
  useEffect(() => {
    if (resetKey) {
      setSearchQuery("")
      setSelectedPriorities(new Set())
      setSelectedStatuses(new Set())
      setCollapsedGroups(new Set())
    }
  }, [resetKey])

  // 그룹 접기/펼치기 토글
  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey)
      } else {
        newSet.add(groupKey)
      }
      return newSet
    })
  }

  // 사이드바 리사이즈 핸들러
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      
      const newWidth = e.clientX
      const minWidth = 200
      const maxWidth = 600
      
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [isResizing])

  // 등급 필터 토글
  const togglePriorityFilter = (priority: number) => {
    setSelectedPriorities((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(priority)) {
        newSet.delete(priority)
      } else {
        newSet.add(priority)
      }
      return newSet
    })
  }

  // 진행상태 필터 토글
  const toggleStatusFilter = (status: string) => {
    setSelectedStatuses((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(status)) {
        newSet.delete(status)
      } else {
        newSet.add(status)
      }
      return newSet
    })
  }

  // 등급 라벨 가져오기 (검색용 - 간단한 라벨)
  const getPriorityLabelForSearch = (priority: number) => {
    switch (priority) {
      case 3:
        return "긴급"
      case 2:
        return "주요"
      case 1:
        return "일반"
      default:
        return "낮음"
    }
  }

  // 진행상태 라벨 가져오기 (검색용)
  const getStatusLabelForSearch = (status: string) => {
    switch (status) {
      case "not_started":
        return "대기"
      case "in_progress":
        return "진행중"
      case "completed":
        return "완료"
      case "on_hold":
        return "보류"
      default:
        return "대기"
    }
  }

  // 필터링된 노트
  // 필터가 선택되지 않았으면 전체 노트를 표시 (아무것도 선택 안 되면 전체로 간주)
  const filteredNotes = useMemo(() => {
    // 아무 필터도 선택되지 않았으면 전체 노트 반환
    const hasNoFilters = !searchQuery.trim() && selectedPriorities.size === 0 && selectedStatuses.size === 0
    if (hasNoFilters) {
      return notes
    }

    let result = [...notes] // 원본 배열 복사

    // 검색 필터 (검색어가 있을 때만 적용)
    // 제목, 내용, 등급, 진행상태 모두 검색 대상
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter((note) => {
        const title = (note.title || "").toLowerCase()
        const content = (note.content || "").toLowerCase()
        const priorityLabel = getPriorityLabelForSearch(note.priority ?? 1).toLowerCase()
        const statusLabel = getStatusLabelForSearch(note.status ?? "not_started").toLowerCase()
        
        return (
          title.includes(query) || 
          content.includes(query) ||
          priorityLabel.includes(query) ||
          statusLabel.includes(query)
        )
      })
    }

    // 등급 필터 (선택된 등급이 있을 때만 적용)
    if (selectedPriorities.size > 0) {
      result = result.filter((note) => {
        const notePriority = Number(note.priority) ?? 1
        return selectedPriorities.has(notePriority)
      })
    }

    // 진행상태 필터 (선택된 상태가 있을 때만 적용)
    if (selectedStatuses.size > 0) {
      result = result.filter((note) => {
        const noteStatus = note.status ?? "not_started"
        return selectedStatuses.has(noteStatus)
      })
    }

    return result
  }, [notes, searchQuery, selectedPriorities, selectedStatuses])

  // 날짜별로 노트 그룹화
  const notesByDate = useMemo(() => {
    const grouped = filteredNotes.reduce((acc, note) => {
      const date = new Date(note.date)
      // 로컬 시간으로 날짜 키 생성 (UTC 변환 방지)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateKey = `${year}-${month}-${day}` // YYYY-MM-DD
      
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(note)
      return acc
    }, {} as Record<string, Note[]>)

    // 날짜순 정렬 (최신순)
    return Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]))
  }, [filteredNotes])

  // 검색/필터가 활성화되면 해당 그룹들을 자동으로 펼치기
  // 필터가 없을 때는 모든 그룹을 접힌 상태로 유지
  useEffect(() => {
    const hasActiveFilters = searchQuery.trim().length > 0 || selectedPriorities.size > 0 || selectedStatuses.size > 0
    
    if (hasActiveFilters && notesByDate.length > 0) {
      // 필터가 활성화되면 검색 결과에 포함된 모든 날짜 그룹을 펼치기
      setCollapsedGroups((prev) => {
        const newSet = new Set(prev)
        notesByDate.forEach(([dateKey]) => {
          newSet.delete(`date-${dateKey}`)
        })
        return newSet
      })
    } else if (!hasActiveFilters) {
      // 필터가 없을 때는 모든 그룹을 접힌 상태로 설정
      setCollapsedGroups((prev) => {
        const newSet = new Set<string>()
        notesByDate.forEach(([dateKey]) => {
          newSet.add(`date-${dateKey}`)
        })
        return newSet
      })
    }
  }, [searchQuery, selectedPriorities, selectedStatuses, notesByDate])

  // 등급별로 노트 그룹화 (필터링에만 사용, 제거 가능)
  const notesByPriority = useMemo(() => {
    const grouped = filteredNotes.reduce((acc, note) => {
      const priority = note.priority ?? 1
      if (!acc[priority]) {
        acc[priority] = []
      }
      acc[priority].push(note)
      return acc
    }, {} as Record<number, Note[]>)

    // 등급순 정렬 (긴급 > 주요 > 일반 > 낮음)
    return Object.entries(grouped)
      .sort((a, b) => Number(b[0]) - Number(a[0]))
      .map(([priority, notes]) => [Number(priority), notes] as [number, Note[]])
  }, [filteredNotes])

  // 진행상태별로 노트 그룹화 (필터링에만 사용, 제거 가능)
  const notesByStatus = useMemo(() => {
    const grouped = filteredNotes.reduce((acc, note) => {
      const status = note.status ?? "not_started"
      if (!acc[status]) {
        acc[status] = []
      }
      acc[status].push(note)
      return acc
    }, {} as Record<string, Note[]>)

    // 진행상태 순서: 대기 > 진행중 > 완료 > 보류
    const statusOrder: Record<string, number> = {
      "not_started": 0,
      "in_progress": 1,
      "completed": 2,
      "on_hold": 3,
    }

    return Object.entries(grouped)
      .sort((a, b) => (statusOrder[a[0]] ?? 999) - (statusOrder[b[0]] ?? 999))
      .map(([status, notes]) => [status, notes] as [string, Note[]])
  }, [filteredNotes])

  // 날짜 포맷팅 (오늘, 어제, 그 외)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    // 로컬 시간으로 날짜 비교 (타임존 이슈 해결)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const compareDate = new Date(date)
    compareDate.setHours(0, 0, 0, 0)

    const isToday = compareDate.getTime() === today.getTime()
    const isYesterday = compareDate.getTime() === yesterday.getTime()

    if (isToday) return "오늘"
    if (isYesterday) return "어제"
    
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // 등급 아이콘 가져오기
  const getPriorityIcon = (priority: number) => {
    switch (priority) {
      case 3:
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 2:
        return <AlertTriangle className="h-5 w-5 text-orange-600" />
      case 1:
        return <CheckCircle2 className="h-4 w-4 text-blue-600" />
      default:
        return <CircleDot className="h-4 w-4 text-gray-500" />
    }
  }

  // 등급 라벨 가져오기
  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 3:
        return "🚨 긴급 처리"
      case 2:
        return "⭐ 주요 사항"
      case 1:
        return "📝 일반 메모"
      default:
        return "📋 보관 메모"
    }
  }

  // 진행상태 아이콘 가져오기
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600 fill-green-600 shrink-0" />
      case "in_progress":
        return <PlayCircle className="h-5 w-5 text-blue-400 fill-blue-400 shrink-0" />
      case "on_hold":
        return <Pause className="h-5 w-5 text-gray-600 shrink-0" />
      default:
        return <Square className="h-5 w-5 text-gray-600 fill-gray-600 shrink-0" />
    }
  }

  // 등급별 테두리 색상 가져오기
  const getPriorityBorderColor = (priority: number) => {
    switch (priority) {
      case 3:
        return "border-l-red-500 border-b-red-500"
      case 2:
        return "border-l-orange-500 border-b-orange-500"
      case 1:
        return "border-l-blue-500 border-b-blue-500"
      default:
        return "border-l-gray-400 border-b-gray-400"
    }
  }

  // 진행상태 라벨 가져오기
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "not_started":
        return "대기"
      case "in_progress":
        return "진행중"
      case "completed":
        return "완료"
      case "on_hold":
        return "보류"
      default:
        return "대기"
    }
  }

  return (
    <div className={cn(
      "fixed md:relative left-0 top-0 h-full flex-col border-r border-border bg-sidebar z-50 md:flex md:translate-x-0 transition-transform duration-300 ease-in-out",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )} style={{ width: isOpen ? `${sidebarWidth}px` : undefined }} ref={sidebarRef}>
      <div className="flex items-center justify-between border-b border-sidebar-border p-4">
        <h1 className="text-xl font-semibold text-sidebar-foreground">Notes</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onCreateNote} className="h-8 w-8">
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8 md:hidden">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-sidebar-accent border-sidebar-border"
          />
        </div>
        
        {/* 필터 섹션 */}
        <div className="space-y-2">
          {/* 등급 필터 */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1.5 px-1">등급 필터</div>
            <div className="flex gap-1 flex-wrap">
              {[
                { value: 3, label: "긴급", color: "bg-red-500 text-white", hoverColor: "hover:bg-red-50" },
                { value: 2, label: "주요", color: "bg-orange-500 text-white", hoverColor: "hover:bg-orange-50" },
                { value: 1, label: "일반", color: "bg-blue-500 text-white", hoverColor: "hover:bg-blue-50" },
                { value: 0, label: "낮음", color: "bg-gray-400 text-white", hoverColor: "hover:bg-gray-100" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => togglePriorityFilter(item.value)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200",
                    selectedPriorities.has(item.value)
                      ? item.color
                      : `${item.hoverColor} text-muted-foreground bg-muted`
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 진행상태 필터 */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1.5 px-1">진행상태 필터</div>
            <div className="flex gap-1 flex-wrap">
              {[
                { value: "not_started", label: "대기", icon: Square, color: "text-red-600 fill-red-600" },
                { value: "in_progress", label: "진행중", icon: PlayCircle, color: "text-blue-400 fill-blue-400" },
                { value: "completed", label: "완료", icon: Square, color: "text-green-600 fill-green-600" },
                { value: "on_hold", label: "보류", icon: Pause, color: "text-gray-600" },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => toggleStatusFilter(item.value)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200",
                      selectedStatuses.has(item.value)
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground bg-muted hover:bg-background"
                    )}
                  >
                    <Icon className={cn("h-3 w-3", selectedStatuses.has(item.value) ? item.color : "")} />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 pb-4">
          {notesByDate.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              노트가 없습니다
            </div>
          ) : (
            notesByDate.map(([dateKey, dateNotes]) => {
              const isCollapsed = collapsedGroups.has(`date-${dateKey}`)
              return (
                <div key={dateKey} className="mb-4">
                  <div 
                    className="flex items-center gap-2 px-3 py-2 text-base font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-sidebar-accent/50 rounded-md transition-colors"
                    onClick={() => toggleGroup(`date-${dateKey}`)}
                  >
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    <Calendar className="h-5 w-5" />
                    <span className="flex items-center">{formatDate(dateKey)}</span>
                    <span className="text-xs font-normal text-muted-foreground/70 flex items-center pt-0.5">
                      ({dateNotes.length})
                    </span>
                  </div>
                  {!isCollapsed && (
                    <div className="space-y-1">
                      {dateNotes
                        .sort((a, b) => (b.priority ?? 1) - (a.priority ?? 1))
                        .map((note) => (
                          <div
                            key={note.id}
                            className={cn(
                              "group relative flex items-center gap-2 rounded-md px-3 py-2.5 cursor-pointer transition-colors text-base",
                              "border-l-4 border-b-2",
                              getPriorityBorderColor(note.priority ?? 1),
                              activeNoteId === note.id
                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                              note.status === "completed" && "opacity-60"
                            )}
                            onClick={() => onSelectNote(note.id)}
                          >
                            {getStatusIcon(note.status)}
                            <FileText className={cn("h-6 w-6 shrink-0", note.status === "completed" && "opacity-50")} />
                            <span className={cn("flex-1 truncate", note.status === "completed" && "line-through text-muted-foreground")}>
                              {note.title?.trim() || "제목 없음"}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteNote(note.id)
                              }}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>
      
      {/* 리사이즈 핸들 */}
      <div
        className={cn(
          "absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/50 transition-colors z-10",
          isResizing && "bg-primary"
        )}
        onMouseDown={(e) => {
          e.preventDefault()
          setIsResizing(true)
        }}
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-12 bg-border rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  )
}
