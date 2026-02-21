import { createClient } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name')

        if (error) throw error

        return NextResponse.json({ data })

    } catch (error: any) {
        console.error('API Error:', error); return NextResponse.json({ error: 'Bir hata olu�tu. L�tfen tekrar deneyin.' }, { status: 500 })
    }
}
