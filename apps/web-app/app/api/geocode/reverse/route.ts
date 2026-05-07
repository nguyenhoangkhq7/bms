import { GET as handleGet } from '@/src/api/geocode/reverse/route'
import type { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
	return handleGet(req)
}
