import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 调试信息
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key:', supabaseAnonKey ? 'Present' : 'Missing')

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase 配置缺失！请检查 .env.local 文件')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
})

// 数据库类型定义
export interface Room {
    id: string
    created_at: string
    created_by: string
}

export interface Roll {
    id: string
    room_id: string
    user_name: string
    dice_type: string
    dice_count: number
    results: number[]
    total: number
    result_display_mode: 'sum' | 'statistics'
    statistics_target?: number
    created_at: string
}

export interface User {
    id: string
    name: string
    room_id: string
    last_seen: string
}
