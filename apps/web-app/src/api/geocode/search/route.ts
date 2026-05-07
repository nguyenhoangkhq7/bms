import { NextRequest, NextResponse } from 'next/server'

const PHOTON_ENDPOINT = 'https://photon.komoot.io/api/'
const DEFAULT_LAT = 10.822159
const DEFAULT_LON = 106.686824
const DEFAULT_LIMIT = 5

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get('q') ?? ''
    const limit = req.nextUrl.searchParams.get('limit') ?? String(DEFAULT_LIMIT)
    const lat = req.nextUrl.searchParams.get('lat') ?? String(DEFAULT_LAT)
    const lon = req.nextUrl.searchParams.get('lon') ?? String(DEFAULT_LON)
    const lang = req.nextUrl.searchParams.get('lang')

    const langParam = lang ? `&lang=${encodeURIComponent(lang)}` : ''
    const endpoint = `${PHOTON_ENDPOINT}?q=${encodeURIComponent(query)}&limit=${limit}&lat=${lat}&lon=${lon}${langParam}`
    const response = await fetch(endpoint, { headers: { Accept: 'application/json' } })
    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json({ message: 'Photon search failed', details: text }, { status: response.status })
    }
    const data = await response.json()
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? 'Server error' }, { status: 500 })
  }
}
