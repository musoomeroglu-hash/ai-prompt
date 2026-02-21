import { createClient } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const VoteSchema = z.object({
    vote_type: z.enum(['upvote', 'downvote'])
})

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const parseResult = VoteSchema.safeParse(body)

        if (!parseResult.success) {
            return NextResponse.json({ error: 'Invalid input', details: parseResult.error.format() }, { status: 400 })
        }

        const { vote_type } = parseResult.data

        // Check existing vote
        const { data: existingVote } = await supabase
            .from('votes')
            .select('id, vote_type')
            .eq('user_id', user.id)
            .eq('prompt_id', id)
            .single()

        if (existingVote) {
            if (existingVote.vote_type === vote_type) {
                // Toggle OFF (Delete)
                await supabase.from('votes').delete().eq('id', existingVote.id)
            } else {
                // Switch Vote
                await supabase.from('votes').update({ vote_type }).eq('id', existingVote.id)
            }
        } else {
            // New Vote
            await supabase.from('votes').insert({ user_id: user.id, prompt_id: id, vote_type })
        }

        // Recalculate Score
        const { data: votes } = await supabase
            .from('votes')
            .select('vote_type')
            .eq('prompt_id', id)

        if (votes) {
            const upvotes = votes.filter(v => v.vote_type === 'upvote').length
            const downvotes = votes.filter(v => v.vote_type === 'downvote').length
            const score = upvotes - downvotes

            await supabase
                .from('prompts')
                .update({ upvotes, downvotes, score })
                .eq('id', id)
        }

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Vote Error:', error)
        console.error('API Error:', error); return NextResponse.json({ error: 'Bir hata olustu. Lutfen tekrar deneyin.' }, { status: 500 })
    }
}
