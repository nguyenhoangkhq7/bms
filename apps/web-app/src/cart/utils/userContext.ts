export function getEffectiveUserId(): number | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  const raw = localStorage.getItem('userId')
  const parsed = raw ? Number(raw) : NaN
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed
  }

  return undefined
}
