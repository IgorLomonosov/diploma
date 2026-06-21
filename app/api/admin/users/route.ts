import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/db/mongoose'
import User from '@/lib/db/models/User'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Доступ заборонено' }, { status: 403 })
    }
    await connectDB()
    const users = await User.find()
      .select('_id username email role createdAt')
      .sort({ createdAt: -1 })
    return NextResponse.json({ data: users })
  } catch (error) {
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Доступ заборонено' }, { status: 403 })
    }
    const { userId, role } = await req.json()
    if (!['player', 'moderator', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Невірна роль' }, { status: 400 })
    }
    await connectDB()
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { role } },
      { new: true },
    ).select('_id username email role')
    if (!user) {
      return NextResponse.json(
        { error: 'Користувача не знайдено' },
        { status: 404 },
      )
    }
    return NextResponse.json({ data: user })
  } catch (error) {
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
