const DEFAULT_MOCK_USER_ID = Number(process.env.NEXT_PUBLIC_MOCK_USER_ID ?? 1001)

export function getEffectiveUserId(): number | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  const raw = localStorage.getItem('userId')
  const parsed = raw ? Number(raw) : NaN
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed
  }

  // Fallback user for local/dev mode. This can be replaced by identity-service later.
  localStorage.setItem('userId', String(DEFAULT_MOCK_USER_ID))
  localStorage.setItem('authMode', 'mock')
  return DEFAULT_MOCK_USER_ID
}
