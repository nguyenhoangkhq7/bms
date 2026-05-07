import { POST as handlePost } from '@/src/api/cart/update-quantity/route'
import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
	return handlePost(req)
}
