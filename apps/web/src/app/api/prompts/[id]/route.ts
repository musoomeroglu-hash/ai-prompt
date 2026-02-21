import { createClient } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const UpdatePromptSchema = z.object({
    title: z.string().min(3).max(100).optional(),
    content: z.string().min(10).max(10000).optional(),
    description: z.string().min(10).max(500).optional(),
    category_id: z.string().uuid().optional(),
    target_ai: z.string().optional(),
    difficulty_level: z.enum(['beginner', 'medium', 'advanced']).optional(),
    language: z.string().optional()
})

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = await createClient()

        // Increment view count safely
        try {
            await supabase.rpc('increment_view_count', { row_id: id })
        } catch (e) {
            // Ignore RPC errors for now to prevent crashing
            console.error('View count error:', e)
        }

        const { data, error } = await supabase
            .from('prompts')
            .select(`
                *,
                categories (id, name, slug, icon)
            `)
            .eq('id', id)
            .single()

        if (error) throw error

        return NextResponse.json({ data })

    } catch (error: any) {
        console.error('API Error:', error); return NextResponse.json({ error: 'Bir hata olustu. Lutfen tekrar deneyin.' }, { status: 500 })
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const parseResult = UpdatePromptSchema.safeParse(body)

        if (!parseResult.success) {
            return NextResponse.json({ error: 'Invalid input', details: parseResult.error.format() }, { status: 400 })
        }

        const { error } = await supabase
            .from('prompts')
            .update(parseResult.data)
            .eq('id', id)
            .eq('user_id', user.id) // Ensure ownership

        if (error) throw error

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('API Error:', error); return NextResponse.json({ error: 'Bir hata olustu. Lutfen tekrar deneyin.' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { error } = await supabase
            .from('prompts')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id) // Ensure ownership

        if (error) throw error

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('API Error:', error); return NextResponse.json({ error: 'Bir hata olustu. Lutfen tekrar deneyin.' }, { status: 500 })
    }
}
