'use server'
import { prisma } from "@/shared/lib/prisma"

export interface DbLauncher {
  id: number
  title: string
  image_url: string
  _count: {
    games: number
  }
}

export async function getAllLaunchers(): Promise<DbLauncher[]> {
  try {
    const launchers = await prisma.launcher.findMany({
      include: {
        _count: {
          select: { games: true }
        }
      }
    })
    return launchers
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Error fetching launchers: `, error)
    }
    return []
  }
}
