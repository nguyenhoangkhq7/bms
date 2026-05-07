import { GET as handleGet } from '@/src/api/geocode/search/route'
import type { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
	return handleGet(req)
}
