import { createClient } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ vote: null, isFavorite: false })
        }

        const [voteRes, favRes] = await Promise.all([
            supabase.from('votes').select('vote_type').eq('user_id', user.id).eq('prompt_id', id).single(),
            supabase.from('favorites').select('id').eq('user_id', user.id).eq('prompt_id', id).single()
        ])

        return NextResponse.json({
            vote: voteRes.data?.vote_type || null,
            isFavorite: !!favRes.data
        })

    } catch (error: any) {
        console.error('API Error:', error); return NextResponse.json({ error: 'Bir hata olustu. Lutfen tekrar deneyin.' }, { status: 500 })
    }
}
