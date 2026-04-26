import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const configuredBase = process.env.BACKEND_API_BASE_URL
const BACKEND_BASE_CANDIDATES = configuredBase
  ? [configuredBase]
  : ['http://order-service:8083', 'http://localhost:8083']

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ id: null, userId: null, totalEstimated: 0, items: [] })
    }

    const token = req.headers.get('authorization')
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = token

    let lastError: any = null
    for (const base of BACKEND_BASE_CANDIDATES) {
      try {
        const res = await axios.get(`${base}/cart/users/${userId}`, { headers })
        // Backend wraps in { message, data }
        return NextResponse.json(res.data?.data ?? res.data)
      } catch (err: any) {
        lastError = err
        if (err.response?.status === 404) {
          return NextResponse.json({ id: null, userId: null, totalEstimated: 0, items: [] })
        }
        if (err.response) {
          return NextResponse.json(
            { message: err.response.data?.message ?? err.message },
            { status: err.response.status }
          )
        }
      }
    }

    throw lastError
  } catch (e: any) {
    console.error('Get cart error:', e.message)
    if (e.response?.status === 404) {
      return NextResponse.json({ id: null, userId: null, totalEstimated: 0, items: [] })
    }
    if (e.response) {
      return NextResponse.json(
        { message: e.response.data?.message ?? e.message },
        { status: e.response.status }
      )
    }
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
