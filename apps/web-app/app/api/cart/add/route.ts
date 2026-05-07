import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const configuredBase = process.env.BACKEND_API_BASE_URL
const BACKEND_BASE_CANDIDATES = configuredBase
  ? [configuredBase]
  : ['http://order-service:8083', 'http://localhost:8083']

const RETRYABLE_ERRORS = new Set(['ECONNREFUSED', 'ENOTFOUND', 'ECONNRESET', 'ETIMEDOUT'])
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function postWithRetry(url: string, body: any, headers: Record<string, string>) {
  let lastError: any = null
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await axios.post(url, body, { headers })
    } catch (err: any) {
      lastError = err
      const isRetryable = !err.response && RETRYABLE_ERRORS.has(err.code)
      if (!isRetryable || attempt === 3) {
        throw err
      }
      await delay(400 * attempt)
    }
  }
  throw lastError
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const token = req.headers.get('authorization')

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = token

    let lastError: any = null
    for (const base of BACKEND_BASE_CANDIDATES) {
      try {
        const res = await postWithRetry(`${base}/cart/items/add`, body, headers)
        return NextResponse.json(res.data)
      } catch (err: any) {
        lastError = err
        if (err.response) {
          return NextResponse.json(
            { message: err.response.data?.message ?? err.message, status: err.response.status },
            { status: err.response.status }
          )
        }
      }
    }

    throw lastError
  } catch (e: any) {
    console.error('Cart API error:', e.message)
    if (e.response) {
      return NextResponse.json(
        { message: e.response.data?.message ?? e.message, status: e.response.status },
        { status: e.response.status }
      )
    }
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
