import { POST as handlePost } from '@/src/api/cart/add/route'
import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
	return handlePost(req)
}
