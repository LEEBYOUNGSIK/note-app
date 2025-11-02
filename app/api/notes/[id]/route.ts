import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// 노트 업데이트
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { title, content, date, priority, status } = body

    // 노트 소유권 확인
    const existingNote = await prisma.note.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingNote) {
      return NextResponse.json(
        { error: "노트를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 타이틀과 내용이 모두 비어있는지 확인
    const trimmedTitle = title !== undefined ? (title || "").trim() : existingNote.title
    const trimmedContent = content !== undefined ? (content || "").trim() : existingNote.content
    
    if (!trimmedTitle && !trimmedContent) {
      return NextResponse.json(
        { error: "타이틀이나 내용 중 하나 이상 입력해주세요" },
        { status: 400 }
      )
    }

    const note = await prisma.note.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: trimmedTitle }),
        ...(content !== undefined && { content: trimmedContent }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(priority !== undefined && { priority }),
        ...(status !== undefined && { status }),
      },
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error("Error updating note:", error)
    return NextResponse.json(
      { error: "노트를 업데이트하는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

// 노트 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      )
    }

    const { id } = await params

    // 노트 소유권 확인
    const existingNote = await prisma.note.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingNote) {
      return NextResponse.json(
        { error: "노트를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    await prisma.note.delete({
      where: { id },
    })

    return NextResponse.json({ message: "노트가 삭제되었습니다" })
  } catch (error) {
    console.error("Error deleting note:", error)
    return NextResponse.json(
      { error: "노트를 삭제하는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
