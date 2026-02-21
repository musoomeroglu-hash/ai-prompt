import { createClient } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if already favorited
        const { data: existing } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('prompt_id', id)
            .single()

        if (existing) {
            // Remove favorite
            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('id', existing.id)

            if (error) throw error
            return NextResponse.json({ favorited: false })
        } else {
            // Add favorite
            const { error } = await supabase
                .from('favorites')
                .insert({
                    user_id: user.id,
                    prompt_id: id
                })

            if (error) throw error
            return NextResponse.json({ favorited: true })
        }

    } catch (error: any) {
        console.error('Favorite Error:', error)
        console.error('API Error:', error); return NextResponse.json({ error: 'Bir hata olustu. Lutfen tekrar deneyin.' }, { status: 500 })
    }
}
