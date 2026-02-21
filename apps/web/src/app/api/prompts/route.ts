import { createClient } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const CreatePromptSchema = z.object({
    title: z.string().min(3).max(100),
    content: z.string().min(10).max(10000),
    description: z.string().min(10).max(500),
    category_id: z.string().uuid(),
    target_ai: z.string(),
    difficulty_level: z.enum(['beginner', 'medium', 'advanced']).optional().default('medium'),
    language: z.string().optional().default('tr'),
    tags: z.array(z.string()).optional()
})

export async function GET(req: Request) {
    try {
        const supabase = await createClient()
        const { searchParams } = new URL(req.url)

        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const sort = searchParams.get('sort') || 'popular' // 'popular', 'new', 'top'
        const categoryId = searchParams.get('category_id')
        const search = searchParams.get('search')
        const favorites = searchParams.get('favorites') === 'true'
        const offset = (page - 1) * limit

        let query = supabase
            .from('prompts')
            .select(`
                *,
                categories (name, slug, icon)
                ${favorites ? ', favorites!inner(user_id)' : ''}
            `, { count: 'exact' })

        // Filtering
        if (favorites) {
            query = query.eq('favorites.user_id', (await supabase.auth.getUser()).data.user?.id)
        }

        if (categoryId) {
            query = query.eq('category_id', categoryId)
        }
        if (search) {
            const sanitized = search.slice(0, 100).replace(/[%_\\]/g, '\\$&')
            query = query.or(`title.ilike.%${sanitized}%,description.ilike.%${sanitized}%`)
        }

        // Sorting
        if (sort === 'new') {
            query = query.order('created_at', { ascending: false })
        } else if (sort === 'top') {
            query = query.order('score', { ascending: false })
        } else {
            // Default: Popular (mix of views and score) logic can be complex in SQL, 
            // for now let's use view_count or score. 
            // Let's use score for popular as well for MVP simplicity, or view_count
            query = query.order('view_count', { ascending: false })
        }

        // Pagination
        query = query.range(offset, offset + limit - 1)

        const { data, error, count } = await query

        if (error) throw error

        return NextResponse.json({
            data,
            meta: {
                page,
                limit,
                total: count,
                totalPages: count ? Math.ceil(count / limit) : 0
            }
        })

    } catch (error: any) {
        console.error('Prompts GET Error:', error)
        console.error('API Error:', error); return NextResponse.json({ error: 'Bir hata olu�tu. L�tfen tekrar deneyin.' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const parseResult = CreatePromptSchema.safeParse(body)

        if (!parseResult.success) {
            return NextResponse.json({ error: 'Invalid input', details: parseResult.error.format() }, { status: 400 })
        }

        const { tags, ...promptData } = parseResult.data

        // 1. Create Prompt
        const { data: prompt, error: promptError } = await supabase
            .from('prompts')
            .insert({
                user_id: user.id,
                ...promptData
            })
            .select()
            .single()

        if (promptError) throw promptError

        // 2. Handle Tags (Optional for MVP, but good to have prepared)
        // Logic: Find existing tags or create new ones, then link in prompt_tags
        // Skipped detailed tag implementation for initial MVP speed, can be added later

        return NextResponse.json({ data: prompt }, { status: 201 })

    } catch (error: any) {
        console.error('Prompts POST Error:', error)
        console.error('API Error:', error); return NextResponse.json({ error: 'Bir hata olu�tu. L�tfen tekrar deneyin.' }, { status: 500 })
    }
}
