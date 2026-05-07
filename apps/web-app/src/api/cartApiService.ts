import axios from 'axios'

const configuredBase = process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || process.env.BACKEND_API_BASE_URL
const BACKEND_BASE_CANDIDATES = configuredBase
  ? [configuredBase]
  : ['http://localhost/api/v1/orders', '/api/v1/orders', 'http://localhost:8083']

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

async function getWithRetry(url: string, headers: Record<string, string>) {
  let lastError: any = null
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await axios.get(url, { headers })
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

export const cartApiService = {
  async add(body: any, token?: string | null) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`

    let lastError: any = null
    for (let i = 0; i < BACKEND_BASE_CANDIDATES.length; i++) {
      const base = BACKEND_BASE_CANDIDATES[i]
      try {
        const res = await postWithRetry(`${base}/cart/items/add`, body, headers)
        return res.data
      } catch (err: any) {
        lastError = err
        const isLast = i === BACKEND_BASE_CANDIDATES.length - 1
        // If it's a 404 and not the last candidate, try the next one
        if (err.response?.status === 404 && !isLast) continue
        // For other errors with response (400, 500, etc.), throw immediately
        if (err.response) throw err
      }
    }
    throw lastError
  },

  async get(userId: string, token?: string | null) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`

    let lastError: any = null
    for (let i = 0; i < BACKEND_BASE_CANDIDATES.length; i++) {
      const base = BACKEND_BASE_CANDIDATES[i]
      try {
        const res = await getWithRetry(`${base}/cart/users/${userId}`, headers)
        return res.data?.data ?? res.data
      } catch (err: any) {
        lastError = err
        const isLast = i === BACKEND_BASE_CANDIDATES.length - 1
        if (err.response?.status === 404) {
          // If the backend returns 404 (user has no cart), that's a valid "empty" result
          // But if we are unsure if it's the right base, we might want to continue.
          // However, 404 is a common response for "cart not found".
          // Let's assume if it contains 'api/v1', it's the right base.
          if (base.includes('api/v1')) {
            return { id: null, userId: null, totalEstimated: 0, items: [] }
          }
          if (!isLast) continue
        }
        if (err.response) throw err
      }
    }
    
    if (lastError?.code === 'ECONNREFUSED' || lastError?.code === 'ENOTFOUND') {
       return { id: null, userId: null, totalEstimated: 0, items: [] }
    }
    throw lastError
  },

  async remove(body: any, token?: string | null) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`

    let lastError: any = null
    for (let i = 0; i < BACKEND_BASE_CANDIDATES.length; i++) {
      const base = BACKEND_BASE_CANDIDATES[i]
      try {
        const res = await postWithRetry(`${base}/cart/items/remove`, body, headers)
        return res.data
      } catch (err: any) {
        lastError = err
        const isLast = i === BACKEND_BASE_CANDIDATES.length - 1
        if (err.response?.status === 404 && !isLast) continue
        if (err.response) throw err
      }
    }
    throw lastError
  },

  async updateQuantity(body: any, token?: string | null) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`

    let lastError: any = null
    for (let i = 0; i < BACKEND_BASE_CANDIDATES.length; i++) {
      const base = BACKEND_BASE_CANDIDATES[i]
      try {
        const res = await postWithRetry(`${base}/cart/items/update-quantity`, body, headers)
        return res.data
      } catch (err: any) {
        lastError = err
        const isLast = i === BACKEND_BASE_CANDIDATES.length - 1
        if (err.response?.status === 404 && !isLast) continue
        if (err.response) throw err
      }
    }
    throw lastError
  }
}
