'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestSupabasePage() {
    const [testResult, setTestResult] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)

    const testConnection = async () => {
        setIsLoading(true)
        setTestResult('')

        try {
            console.log('🧪 开始测试 Supabase 连接...')

            // 测试 1: 基本连接
            const { data: rooms, error: roomsError } = await supabase
                .from('rooms')
                .select('*')
                .limit(1)

            if (roomsError) {
                setTestResult(`❌ 房间表查询失败: ${roomsError.message}`)
                return
            }

            setTestResult(prev => prev + '✅ 房间表连接成功\n')

            // 测试 2: 插入测试数据
            const testRoomId = 'TEST' + Date.now()
            const { error: insertError } = await supabase
                .from('rooms')
                .insert({ id: testRoomId })

            if (insertError) {
                setTestResult(prev => prev + `❌ 房间插入失败: ${insertError.message}\n`)
                return
            }

            setTestResult(prev => prev + '✅ 房间插入成功\n')

            // 测试 3: 插入掷骰记录
            const { error: rollError } = await supabase
                .from('rolls')
                .insert({
                    room_id: testRoomId,
                    user_name: '测试用户',
                    dice_type: 'd6',
                    dice_count: 1,
                    results: [6],
                    total: 6
                })

            if (rollError) {
                setTestResult(prev => prev + `❌ 掷骰记录插入失败: ${rollError.message}\n`)
                return
            }

            setTestResult(prev => prev + '✅ 掷骰记录插入成功\n')

            // 测试 4: 查询掷骰记录
            const { data: rolls, error: rollsQueryError } = await supabase
                .from('rolls')
                .select('*')
                .eq('room_id', testRoomId)

            if (rollsQueryError) {
                setTestResult(prev => prev + `❌ 掷骰记录查询失败: ${rollsQueryError.message}\n`)
                return
            }

            setTestResult(prev => prev + `✅ 掷骰记录查询成功，找到 ${rolls?.length || 0} 条记录\n`)

            // 测试 5: 实时订阅
            const subscription = supabase
                .channel('test-channel')
                .on('postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'rolls' },
                    (payload) => {
                        setTestResult(prev => prev + '✅ 实时订阅测试成功！\n')
                        subscription.unsubscribe()
                    }
                )
                .subscribe()

            // 插入一条新记录来触发实时事件
            setTimeout(async () => {
                await supabase
                    .from('rolls')
                    .insert({
                        room_id: testRoomId,
                        user_name: '实时测试',
                        dice_type: 'd6',
                        dice_count: 1,
                        results: [3],
                        total: 3
                    })
            }, 1000)

            setTestResult(prev => prev + '🎉 所有测试通过！Supabase 配置正确。\n')

        } catch (error) {
            setTestResult(prev => prev + `❌ 测试失败: ${(error as Error).message}\n`)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen p-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="max-w-2xl mx-auto">
                <div className="card-glass p-8">
                    <h1 className="text-3xl font-bold text-white mb-6">Supabase 连接测试</h1>

                    <button
                        onClick={testConnection}
                        disabled={isLoading}
                        className="btn-primary mb-6"
                    >
                        {isLoading ? '测试中...' : '开始测试'}
                    </button>

                    {testResult && (
                        <div className="bg-black/20 rounded-lg p-4">
                            <pre className="text-white text-sm whitespace-pre-wrap">{testResult}</pre>
                        </div>
                    )}

                    <div className="mt-8 text-white/70 text-sm">
                        <p>如果测试失败，请检查：</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>.env.local 文件是否存在</li>
                            <li>Supabase URL 和 Key 是否正确</li>
                            <li>数据库表是否已创建</li>
                            <li>网络连接是否正常</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
