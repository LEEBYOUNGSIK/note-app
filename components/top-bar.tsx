"use client"

import { Menu, LogOut, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut, useSession } from "next-auth/react"
import { cn } from "@/lib/utils"

interface TopBarProps {
  onToggleSidebar: () => void
  sidebarOpen: boolean
  isSaving?: boolean
}

export function TopBar({ onToggleSidebar, sidebarOpen, isSaving = false }: TopBarProps) {
  const { data: session } = useSession()

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <div className="flex h-14 items-center justify-between border-b border-border px-3 sm:px-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="h-10 w-10 md:h-8 md:w-8">
          <Menu className="h-5 w-5 md:h-4 md:w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-3">
        {/* 저장 상태 표시 */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="hidden sm:inline">저장 중...</span>
            </>
          ) : (
            <>
              <Check className="h-4 w-4 text-green-500 opacity-70" />
              <span className="hidden sm:inline text-green-500 opacity-70">저장됨</span>
            </>
          )}
        </div>
        
        {session?.user?.email && (
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {session.user.email}
          </span>
        )}
        <Button variant="ghost" size="icon" onClick={handleLogout} className="h-10 w-10 md:h-8 md:w-8">
          <LogOut className="h-5 w-5 md:h-4 md:w-4" />
        </Button>
      </div>
    </div>
  )
}
