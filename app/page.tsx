"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Editor } from "@/components/editor"
import { TopBar } from "@/components/top-bar"

export type Note = {
  id: string
  title: string | null
  content: string
  date: string | Date
  priority: number
  status: "not_started" | "in_progress" | "completed" | "on_hold"
  createdAt: string | Date
  updatedAt: string | Date
  parentId?: string | null
}

export default function NotesApp() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [sidebarResetKey, setSidebarResetKey] = useState("")

  // 인증 체크
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // 화면 크기에 따라 사이드바 상태 조정
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }
    
    handleResize() // 초기 설정
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // 노트 목록 가져오기
  useEffect(() => {
    if (status === "authenticated") {
      fetchNotes()
    }
  }, [status])

  const fetchNotes = async () => {
    try {
      const response = await fetch("/api/notes")
      if (response.ok) {
        const data = await response.json()
        setNotes(data)
        if (data.length > 0 && !activeNoteId) {
          setActiveNoteId(data[0].id)
        }
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectNote = (id: string) => {
    setActiveNoteId(id)
    // 모바일에서 노트 선택 시 사이드바 자동 닫기
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  const activeNote = notes.find((note) => note.id === activeNoteId)

  const handleCreateNote = () => {
    // 임시 노트 생성 (DB 저장 없음)
    const tempId = `temp-${Date.now()}`
    const newNote: Note = {
      id: tempId,
      title: "",
      content: "",
      date: new Date(),
      priority: 1,
      status: "not_started",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    // 새 노트를 즉시 notes 배열에 추가
    setNotes([newNote, ...notes])
    // 새 노트를 활성화
    setActiveNoteId(newNote.id)
    // 사이드바 상태 초기화
    setSidebarResetKey(Date.now().toString())
  }

  // 즉시 UI 업데이트 (Optimistic update, 저장 안함)
  const handleImmediateUpdate = (id: string, updates: Partial<Note>) => {
    setNotes(notes.map((note) => (note.id === id ? { ...note, ...updates } : note)))
  }

  // 실제 저장 (API 호출)
  const handleSaveNote = async (id: string, updates: Partial<Note>) => {
    setIsSaving(true)
    try {
      const isNewNote = id.startsWith("temp-")
      let response: Response
      let savedNote: Note

      if (isNewNote) {
        // 새 노트 생성 (POST)
        response = await fetch("/api/notes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: updates.title || "",
            content: updates.content || "",
            date: updates.date || new Date(),
            priority: updates.priority ?? 1,
            status: updates.status ?? "not_started",
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to create note")
        }

        savedNote = await response.json()
        
        // 임시 노트를 DB에서 저장된 노트로 교체
        setNotes(notes.map((note) => (note.id === id ? savedNote : note)))
        setActiveNoteId(savedNote.id)
      } else {
        // 기존 노트 업데이트 (PATCH)
        response = await fetch(`/api/notes/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        })

        if (!response.ok) {
          const errorData = await response.json()
          // 실패 시 다시 가져오기
          fetchNotes()
          throw new Error(errorData.error || "Failed to update note")
        }

        savedNote = await response.json()
        // 성공 시 업데이트된 데이터로 상태 갱신
        setNotes(notes.map((note) => (note.id === id ? savedNote : note)))
      }
    } catch (error) {
      console.error("Failed to save note:", error)
      fetchNotes()
      throw error // 에러를 다시 throw하여 에디터에서 처리할 수 있도록
    } finally {
      setIsSaving(false)
    }
  }

  // 기존 호환성을 위한 함수 (자동 저장)
  const handleUpdateNote = async (id: string, updates: Partial<Note>) => {
    handleImmediateUpdate(id, updates)
    await handleSaveNote(id, updates)
  }

  const handleDeleteNote = async (id: string) => {
    const isNewNote = id.startsWith("temp-")
    
    if (isNewNote) {
      // 임시 노트는 로컬에서만 제거 (DB 호출 없음)
      const remainingNotes = notes.filter((note) => note.id !== id)
      setNotes(remainingNotes)
      
      if (activeNoteId === id) {
        if (remainingNotes.length > 0) {
          setActiveNoteId(remainingNotes[0].id)
        } else {
          setActiveNoteId(null)
        }
      }
      return
    }

    // 기존 노트는 DB에서 삭제
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        const remainingNotes = notes.filter((note) => note.id !== id)
        setNotes(remainingNotes)
        
        if (activeNoteId === id) {
          if (remainingNotes.length > 0) {
            setActiveNoteId(remainingNotes[0].id)
          } else {
            setActiveNoteId(null)
          }
        }
      }
    } catch (error) {
      console.error("Failed to delete note:", error)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* 모바일에서 백드롭 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar
        notes={notes}
        activeNoteId={activeNoteId || ""}
        onSelectNote={handleSelectNote}
        onCreateNote={handleCreateNote}
        onDeleteNote={handleDeleteNote}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        resetKey={sidebarResetKey}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          sidebarOpen={sidebarOpen}
          isSaving={isSaving}
        />
        {activeNote ? (
          <Editor 
            note={activeNote} 
            onUpdate={(updates) => handleImmediateUpdate(activeNote.id, updates)}
            onSave={(updates) => handleSaveNote(activeNote.id, updates)}
            onSaveStatusChange={setIsSaving}
            isSaving={isSaving}
          />
        ) : notes.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-2">노트가 없습니다</p>
              <p className="text-sm">새 노트를 만들어보세요</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
