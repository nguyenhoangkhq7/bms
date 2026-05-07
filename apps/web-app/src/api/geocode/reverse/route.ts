import { NextRequest, NextResponse } from 'next/server'

const PHOTON_REVERSE_ENDPOINT = 'https://photon.komoot.io/reverse'

export async function GET(req: NextRequest) {
  try {
    const lat = req.nextUrl.searchParams.get('lat')
    const lon = req.nextUrl.searchParams.get('lon')
    const limit = req.nextUrl.searchParams.get('limit') ?? '1'

    if (!lat || !lon) {
      return NextResponse.json({ message: 'Missing lat/lon' }, { status: 400 })
    }

    const endpoint = `${PHOTON_REVERSE_ENDPOINT}?lat=${lat}&lon=${lon}&limit=${limit}`
    const response = await fetch(endpoint, { headers: { Accept: 'application/json' } })
    const data = await response.json()
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? 'Server error' }, { status: 500 })
  }
}
