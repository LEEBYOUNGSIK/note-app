import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// 노트 목록 가져오기
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      )
    }

    const notes = await prisma.note.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [
        { priority: "desc" },
        { date: "desc" },
        { updatedAt: "desc" },
      ],
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error("Error fetching notes:", error)
    return NextResponse.json(
      { error: "노트를 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

// 새 노트 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, content, parentId, date, priority, status } = body

    // 새 노트 생성 시에는 빈 값도 허용 (저장 시에만 검증)
    const trimmedTitle = (title || "").trim()
    const trimmedContent = (content || "").trim()

    const note = await prisma.note.create({
      data: {
        title: trimmedTitle,
        content: trimmedContent,
        userId: session.user.id,
        parentId: parentId || null,
        date: date ? new Date(date) : new Date(),
        priority: priority !== undefined ? priority : 1,
        status: status !== undefined ? status : "not_started",
      },
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error("Error creating note:", error)
    return NextResponse.json(
      { error: "노트를 생성하는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
