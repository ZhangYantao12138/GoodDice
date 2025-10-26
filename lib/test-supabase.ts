import { supabase } from './supabase'

export async function testSupabaseConnection() {
    console.log('🧪 开始测试 Supabase 连接...')

    try {
        // 测试基本连接
        const { data, error } = await supabase
            .from('rooms')
            .select('id')
            .limit(1)

        if (error) {
            console.error('❌ Supabase 连接失败:', error)
            return { success: false, error: error.message }
        }

        console.log('✅ Supabase 连接成功')
        return { success: true, data }
    } catch (error) {
        console.error('❌ 连接测试异常:', error)
        return { success: false, error: (error as Error).message }
    }
}

export async function testInsertRoll(roomId: string, userName: string) {
    console.log('🧪 测试插入掷骰记录...')

    try {
        const rollData = {
            room_id: roomId,
            user_name: userName,
            dice_type: 'd6',
            dice_count: 1,
            results: [6],
            total: 6
        }

        const { data, error } = await supabase
            .from('rolls')
            .insert(rollData)
            .select()

        if (error) {
            console.error('❌ 插入掷骰记录失败:', error)
            return { success: false, error: error.message }
        }

        console.log('✅ 掷骰记录插入成功:', data)
        return { success: true, data }
    } catch (error) {
        console.error('❌ 插入测试异常:', error)
        return { success: false, error: (error as Error).message }
    }
}
