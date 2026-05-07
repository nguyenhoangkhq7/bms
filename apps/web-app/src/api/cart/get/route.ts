import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const configuredBase = process.env.BACKEND_API_BASE_URL
const BACKEND_BASE_CANDIDATES = configuredBase
  ? [configuredBase]
  : ['http://order-service:8083', 'http://localhost:8083']

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function fetchCartWithRetry(userId: string, headers: Record<string, string>) {
  let lastError: any = null

  for (const base of BACKEND_BASE_CANDIDATES) {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const res = await axios.get(`${base}/cart/users/${userId}`, { headers })
        return res.data?.data ?? res.data
      } catch (err: any) {
        lastError = err
        if (err.response?.status === 404) {
          return { id: null, userId: null, totalEstimated: 0, items: [] }
        }

        const isLastAttempt = attempt === 3
        const isConnectionIssue =
          !err.response &&
          (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT')

        if (!isLastAttempt && isConnectionIssue) {
          await delay(500 * attempt)
          continue
        }

        if (err.response) {
          throw err
        }
      }
    }
  }

  throw lastError
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ id: null, userId: null, totalEstimated: 0, items: [] })
    }

    const token = req.headers.get('authorization')
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = token

    const cart = await fetchCartWithRetry(userId, headers)
    return NextResponse.json(cart)
  } catch (e: any) {
    if (e.response?.status === 404 || e.code === 'ECONNREFUSED' || e.code === 'ENOTFOUND') {
      return NextResponse.json({ id: null, userId: null, totalEstimated: 0, items: [] })
    }
    console.error('Get cart error:', e.message)
    if (e.response) {
      return NextResponse.json(
        { message: e.response.data?.message ?? e.message },
        { status: e.response.status }
      )
    }
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
