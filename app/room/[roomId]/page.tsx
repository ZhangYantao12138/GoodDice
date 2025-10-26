'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Dice6, Users, Clock, Copy, Check } from 'lucide-react'
import { supabase, type Roll } from '@/lib/supabase'
import { rollDice, getDiceTypeName, storage } from '@/lib/utils'
import { testSupabaseConnection, testInsertRoll } from '@/lib/test-supabase'
import DiceSelector from '@/components/DiceSelector'
import RollHistory from '@/components/RollHistory'
import MemberList from '@/components/MemberList'

const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100]

export default function RoomPage() {
    const router = useRouter()
    const params = useParams()
    const roomId = params.roomId as string

    const [nickname, setNickname] = useState('')
    const [selectedDiceType, setSelectedDiceType] = useState(6)
    const [diceCount, setDiceCount] = useState(1)
    const [rolls, setRolls] = useState<Roll[]>([])
    const [isRolling, setIsRolling] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [copySuccess, setCopySuccess] = useState(false)
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')
    const [members, setMembers] = useState<Array<{ id: string, name: string, isOnline: boolean, lastSeen: string }>>([])
    const [resultDisplayMode, setResultDisplayMode] = useState<'sum' | 'statistics'>('sum')
    const [statisticsTarget, setStatisticsTarget] = useState<number>(1)

    // 当骰子类型改变时，如果不支持统计模式，自动切换回加和模式
    useEffect(() => {
        if (![4, 6, 8, 10].includes(selectedDiceType) && resultDisplayMode === 'statistics') {
            setResultDisplayMode('sum')
        }
    }, [selectedDiceType, resultDisplayMode])

    // 播放掷骰音效
    const playDiceSound = () => {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

            // 创建更真实的骰子滚动音效
            const duration = 0.8 // 0.8秒
            const bufferSize = audioContext.sampleRate * duration
            const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)
            const output = buffer.getChannelData(0)

            for (let i = 0; i < bufferSize; i++) {
                const t = i / bufferSize

                // 创建多个频率的混合，模拟骰子碰撞
                let sample = 0

                // 高频碰撞声（骰子撞击）
                const highFreq = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 3)
                sample += highFreq * 0.3

                // 中频滚动声
                const midFreq = Math.sin(2 * Math.PI * 200 * t) * Math.exp(-t * 2)
                sample += midFreq * 0.4

                // 低频摩擦声
                const lowFreq = Math.sin(2 * Math.PI * 50 * t) * Math.exp(-t * 1.5)
                sample += lowFreq * 0.3

                // 添加随机噪声模拟不规则碰撞
                const noise = (Math.random() * 2 - 1) * 0.1 * Math.exp(-t * 2)
                sample += noise

                // 应用淡出效果
                const fadeOut = Math.pow(1 - t, 2)
                output[i] = sample * fadeOut * 0.15 // 控制音量
            }

            const source = audioContext.createBufferSource()
            source.buffer = buffer
            source.connect(audioContext.destination)
            source.start()
        } catch (error) {
            console.log('音效播放失败:', error)
        }
    }

    useEffect(() => {
        // 获取昵称
        const savedNickname = storage.get('nickname')
        if (savedNickname) {
            setNickname(savedNickname)
        } else {
            router.push('/')
            return
        }

        // 初始化房间
        initializeRoom()
    }, [roomId, router])

    const initializeRoom = async () => {
        try {
            setIsLoading(true)
            console.log('🚀 开始初始化房间:', roomId)

            // 测试 Supabase 连接
            const { data: testData, error: testError } = await supabase
                .from('rooms')
                .select('id')
                .limit(1)

            if (testError) {
                console.error('❌ Supabase 连接失败:', testError)
                setConnectionStatus('error')
                alert('数据库连接失败，请检查配置')
                setIsLoading(false)
                return
            }

            console.log('✅ Supabase 连接成功')
            setConnectionStatus('connected')

            // 创建房间（如果不存在）
            const { error: roomError } = await supabase
                .from('rooms')
                .upsert({ id: roomId }, { onConflict: 'id' })

            if (roomError) {
                console.error('❌ 房间创建失败:', roomError)
                alert('房间创建失败: ' + roomError.message)
                setIsLoading(false)
                return
            }

            console.log('✅ 房间创建成功')

            // 获取历史记录（只显示最近4条）
            const { data: rollsData, error: rollsError } = await supabase
                .from('rolls')
                .select('*')
                .eq('room_id', roomId)
                .order('created_at', { ascending: false })
                .limit(4)

            if (rollsError) {
                console.error('❌ 获取历史记录失败:', rollsError)
                alert('获取历史记录失败: ' + rollsError.message)
            } else {
                console.log('✅ 历史记录加载成功:', rollsData?.length || 0, '条记录')
                setRolls(rollsData || [])
            }

            // 获取成员列表
            const { data: membersData, error: membersError } = await supabase
                .from('users')
                .select('*')
                .eq('room_id', roomId)
                .order('last_seen', { ascending: false })

            if (membersError) {
                console.error('❌ 获取成员列表失败:', membersError)
            } else {
                console.log('✅ 成员列表加载成功:', membersData?.length || 0, '个成员')
                const mappedMembers = membersData?.map(member => ({
                    id: member.id,
                    name: member.name,
                    isOnline: true, // 简化处理，假设所有成员都在线
                    lastSeen: member.last_seen
                })) || []
                console.log('📋 映射后的成员列表:', mappedMembers)
                setMembers(mappedMembers)
            }

            // 添加当前用户到成员列表
            const { error: userError } = await supabase
                .from('users')
                .upsert({
                    name: nickname,
                    room_id: roomId,
                    last_seen: new Date().toISOString()
                }, { onConflict: 'name,room_id' })

            if (userError) {
                console.error('❌ 添加用户失败:', userError)
            }

            // 确保当前用户在成员列表中
            const currentUserExists = membersData?.some(member => member.name === nickname)
            console.log('👤 当前用户是否存在:', currentUserExists, '昵称:', nickname)

            if (!currentUserExists) {
                // 如果当前用户不在数据库中，添加到本地状态
                const currentUser = {
                    id: `current-${Date.now()}`,
                    name: nickname,
                    isOnline: true,
                    lastSeen: new Date().toISOString()
                }
                console.log('➕ 添加当前用户到成员列表:', currentUser)
                setMembers(prev => {
                    const updated = [...prev, currentUser]
                    console.log('📋 更新后的成员列表:', updated)
                    return updated
                })
            } else {
                console.log('✅ 当前用户已在数据库中')
            }

            // 订阅实时更新
            console.log('📡 开始订阅实时更新...')
            const subscription = supabase
                .channel(`room-${roomId}`)
                .on('postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'rolls', filter: `room_id=eq.${roomId}` },
                    (payload) => {
                        console.log('🔄 收到新的掷骰记录:', payload.new)
                        const newRoll = payload.new as Roll
                        setRolls(prev => {
                            const updated = [newRoll, ...prev]
                            // 只保留最近4条记录
                            return updated.slice(0, 4)
                        })
                    }
                )
                .on('postgres_changes',
                    { event: 'DELETE', schema: 'public', table: 'rolls', filter: `room_id=eq.${roomId}` },
                    (payload) => {
                        console.log('🔄 收到删除记录:', payload.old)
                        const deletedRoll = payload.old as Roll
                        setRolls(prev => {
                            const filtered = prev.filter(roll => roll.id !== deletedRoll.id)
                            // 如果删除后少于4条，尝试从数据库获取更多记录
                            if (filtered.length < 4) {
                                supabase
                                    .from('rolls')
                                    .select('*')
                                    .eq('room_id', roomId)
                                    .order('created_at', { ascending: false })
                                    .limit(4)
                                    .then(({ data }) => {
                                        if (data) {
                                            setRolls(data)
                                        }
                                    })
                            }
                            return filtered
                        })
                    }
                )
                .on('postgres_changes',
                    { event: 'UPDATE', schema: 'public', table: 'rolls', filter: `room_id=eq.${roomId}` },
                    (payload) => {
                        console.log('🔄 收到更新记录:', payload.new)
                        const updatedRoll = payload.new as Roll
                        setRolls(prev => prev.map(roll =>
                            roll.id === updatedRoll.id ? updatedRoll : roll
                        ))
                    }
                )
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'users', filter: `room_id=eq.${roomId}` },
                    (payload) => {
                        console.log('🔄 收到成员更新:', payload)
                        // 重新获取成员列表，但保留当前用户
                        supabase
                            .from('users')
                            .select('*')
                            .eq('room_id', roomId)
                            .order('last_seen', { ascending: false })
                            .then(({ data }) => {
                                if (data) {
                                    const dbMembers = data.map(member => ({
                                        id: member.id,
                                        name: member.name,
                                        isOnline: true,
                                        lastSeen: member.last_seen
                                    }))

                                    // 确保当前用户在列表中
                                    const hasCurrentUser = dbMembers.some(member => member.name === nickname)
                                    if (!hasCurrentUser) {
                                        dbMembers.push({
                                            id: `current-${Date.now()}`,
                                            name: nickname,
                                            isOnline: true,
                                            lastSeen: new Date().toISOString()
                                        })
                                    }

                                    setMembers(dbMembers)
                                }
                            })
                    }
                )
                .subscribe((status) => {
                    console.log('📡 订阅状态:', status)
                })

            setIsLoading(false)
            console.log('✅ 房间初始化完成')

            return () => {
                console.log('🔌 取消订阅')
                subscription.unsubscribe()
            }
        } catch (error) {
            console.error('❌ 初始化房间失败:', error)
            alert('初始化失败: ' + (error as Error).message)
            setIsLoading(false)
        }
    }

    const handleRoll = async () => {
        if (!nickname.trim() || isRolling) return

        setIsRolling(true)
        console.log('🎲 开始掷骰:', { selectedDiceType, diceCount, nickname })

        // 播放掷骰音效
        playDiceSound()

        try {
            // 生成掷骰结果
            const { results, total } = rollDice(selectedDiceType, diceCount)
            console.log('🎲 掷骰结果:', { results, total })

            // 计算统计结果（仅支持d4/d6/d8/d10）
            const canUseStatistics = [4, 6, 8, 10].includes(selectedDiceType)
            const actualDisplayMode = canUseStatistics ? resultDisplayMode : 'sum'
            const statisticsCount = actualDisplayMode === 'statistics'
                ? results.filter(r => r === statisticsTarget).length
                : 0

            // 保存到数据库
            const rollData = {
                room_id: roomId,
                user_name: nickname,
                dice_type: getDiceTypeName(selectedDiceType),
                dice_count: diceCount,
                results,
                total: actualDisplayMode === 'sum' ? total : statisticsCount,
                result_display_mode: actualDisplayMode,
                statistics_target: actualDisplayMode === 'statistics' ? statisticsTarget : null
            }

            console.log('💾 保存掷骰数据:', rollData)

            const { data, error } = await supabase
                .from('rolls')
                .insert(rollData)
                .select()

            if (error) {
                console.error('❌ 保存掷骰结果失败:', error)
                alert('掷骰失败: ' + error.message)
            } else {
                console.log('✅ 掷骰结果保存成功:', data)
                // 实时订阅会自动处理新记录的添加，不需要手动添加
            }
        } catch (error) {
            console.error('❌ 掷骰失败:', error)
            alert('掷骰失败: ' + (error as Error).message)
        } finally {
            setIsRolling(false)
        }
    }

    const copyRoomCode = async () => {
        try {
            await navigator.clipboard.writeText(roomId)
            setCopySuccess(true)
            setTimeout(() => setCopySuccess(false), 2000)
        } catch (error) {
            console.error('复制失败:', error)
        }
    }

    // 更新昵称
    const handleUpdateNickname = async (newNickname: string) => {
        if (!newNickname.trim() || newNickname.trim() === nickname) return

        try {
            // 更新本地存储
            storage.set('nickname', newNickname.trim())
            setNickname(newNickname.trim())

            // 更新数据库中的用户信息
            const { error } = await supabase
                .from('users')
                .upsert({
                    name: newNickname.trim(),
                    room_id: roomId,
                    last_seen: new Date().toISOString()
                }, { onConflict: 'name,room_id' })

            if (error) {
                console.error('更新昵称失败:', error)
            }
        } catch (error) {
            console.error('更新昵称失败:', error)
        }
    }

    // 重复上一次投掷
    const handleRepeatLastRoll = async () => {
        if (rolls.length === 0 || isRolling) return

        const lastRoll = rolls[0]
        setSelectedDiceType(parseInt(lastRoll.dice_type.replace('d', '')))
        setDiceCount(lastRoll.dice_count)

        // 播放掷骰音效
        playDiceSound()

        // 执行投掷
        await handleRoll()
    }

    // 再投一次指定记录
    const handleReroll = async (roll: Roll) => {
        if (isRolling) return

        setSelectedDiceType(parseInt(roll.dice_type.replace('d', '')))
        setDiceCount(roll.dice_count)

        // 执行投掷
        await handleRoll()
    }

    // 重投此条 - 覆盖当前记录
    const handleRerollThisRecord = async (roll: Roll) => {
        if (isRolling) return

        setIsRolling(true)
        console.log('🔄 重投此条记录:', roll.id)

        // 播放掷骰音效
        playDiceSound()

        try {
            // 生成新的掷骰结果
            const { results, total } = rollDice(parseInt(roll.dice_type.replace('d', '')), roll.dice_count)
            console.log('🎲 重投结果:', { results, total })

            // 计算统计结果
            const statisticsCount = roll.result_display_mode === 'statistics' && roll.statistics_target
                ? results.filter(r => r === roll.statistics_target).length
                : 0

            // 更新数据库中的记录
            const { error } = await supabase
                .from('rolls')
                .update({
                    results,
                    total: roll.result_display_mode === 'sum' ? total : statisticsCount
                })
                .eq('id', roll.id)

            if (error) {
                console.error('❌ 更新记录失败:', error)
                alert('重投失败: ' + error.message)
            } else {
                console.log('✅ 记录更新成功')
                // 更新本地状态
                setRolls(prev => prev.map(r =>
                    r.id === roll.id
                        ? { ...r, results, total }
                        : r
                ))
            }
        } catch (error) {
            console.error('❌ 重投失败:', error)
            alert('重投失败: ' + (error as Error).message)
        } finally {
            setIsRolling(false)
        }
    }

    // 删除指定记录
    const handleDeleteRoll = async (roll: Roll) => {
        if (isRolling) return

        try {
            const { error } = await supabase
                .from('rolls')
                .delete()
                .eq('id', roll.id)

            if (error) {
                console.error('❌ 删除记录失败:', error)
                alert('删除失败: ' + error.message)
            } else {
                console.log('✅ 记录删除成功')
                // 从本地状态中移除
                setRolls(prev => prev.filter(r => r.id !== roll.id))
            }
        } catch (error) {
            console.error('❌ 删除记录失败:', error)
            alert('删除失败: ' + (error as Error).message)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="glass p-8 rounded-2xl text-center">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white">正在进入房间...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen w-screen p-8">
            {/* 背景装饰 */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 h-full w-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 h-20">
                    <button
                        onClick={() => router.push('/')}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        返回主页
                    </button>

                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white mb-1">房间 {roomId}</h1>
                        <p className="text-white/70">欢迎，{nickname}</p>
                        <div className="flex items-center justify-center gap-2 mt-1">
                            <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400' :
                                connectionStatus === 'error' ? 'bg-red-400' : 'bg-yellow-400'
                                }`}></div>
                            <span className="text-xs text-white/50">
                                {connectionStatus === 'connected' ? '已连接' :
                                    connectionStatus === 'error' ? '连接失败' : '连接中...'}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={copyRoomCode}
                        className="btn-secondary flex items-center gap-2"
                    >
                        {copySuccess ? (
                            <>
                                <Check className="w-4 h-4" />
                                已复制
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4" />
                                复制房间码
                            </>
                        )}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[3fr_7fr] gap-8 h-[calc(100vh-12rem)]">
                    {/* 左侧列：掷骰面板 + 成员列表 */}
                    <div className="lg:col-span-1 flex flex-col gap-4">
                        {/* 掷骰面板 */}
                        <div className="card-glass flex-1 flex flex-col">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Dice6 className="w-6 h-6" />
                                掷骰面板
                            </h2>

                            {/* 骰子类型选择 */}
                            <DiceSelector
                                selectedType={selectedDiceType}
                                onTypeChange={setSelectedDiceType}
                                diceTypes={DICE_TYPES}
                            />

                            {/* 骰子数量 */}
                            <div className="mb-4">
                                <label className="block text-white/90 text-lg font-medium mb-2">
                                    骰子数量
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={diceCount}
                                    onChange={(e) => setDiceCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                                    className="input-glass w-full px-4 py-3 rounded-xl text-base"
                                />
                            </div>

                            {/* 掷骰按钮 */}
                            <button
                                onClick={handleRoll}
                                disabled={isRolling}
                                className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-3 mb-3"
                            >
                                {isRolling ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        掷骰中...
                                    </>
                                ) : (
                                    <>
                                        掷骰
                                    </>
                                )}
                            </button>

                            {/* 结果显示方式切换 */}
                            {[4, 6, 8, 10].includes(selectedDiceType) && (
                                <div className="mb-4">
                                    <label className="block text-white/90 text-base font-medium mb-2">
                                        结果显示方式
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setResultDisplayMode('sum')}
                                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${resultDisplayMode === 'sum'
                                                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                                                : 'glass text-white/70 hover:text-white hover:bg-white/10'
                                                }`}
                                        >
                                            加和结果
                                        </button>
                                        <button
                                            onClick={() => setResultDisplayMode('statistics')}
                                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${resultDisplayMode === 'statistics'
                                                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                                                : 'glass text-white/70 hover:text-white hover:bg-white/10'
                                                }`}
                                        >
                                            统计结果
                                        </button>
                                    </div>

                                    {resultDisplayMode === 'statistics' && (
                                        <div className="mt-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white/70 text-sm">统计数字:</span>
                                                <div className="flex gap-1">
                                                    {Array.from({ length: selectedDiceType }, (_, i) => i + 1).map(num => (
                                                        <button
                                                            key={num}
                                                            onClick={() => setStatisticsTarget(num)}
                                                            className={`w-8 h-8 rounded text-sm font-medium transition-all ${statisticsTarget === num
                                                                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                                                                : 'glass text-white/70 hover:text-white hover:bg-white/10'
                                                                }`}
                                                        >
                                                            {num}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 重复上一次投掷 */}
                            {rolls.length > 0 && (
                                <button
                                    onClick={handleRepeatLastRoll}
                                    disabled={isRolling}
                                    className="btn-secondary w-full flex items-center justify-center gap-2 text-base py-2"
                                >
                                    <Clock className="w-5 h-5" />
                                    重复上一次投掷
                                </button>
                            )}
                        </div>

                        {/* 成员列表 */}
                        <div className="card-glass flex-1 flex flex-col">
                            <MemberList
                                members={members}
                                currentUser={nickname}
                                onUpdateNickname={handleUpdateNickname}
                            />
                        </div>
                    </div>

                    {/* 右侧列：历史记录 */}
                    <div className="lg:col-span-1">
                        <div className="card-glass h-full flex flex-col">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 flex-shrink-0">
                                <Clock className="w-8 h-8" />
                                掷骰历史 ({rolls.length}/4)
                            </h2>

                            <div className="flex-1 min-h-0">
                                <RollHistory
                                    rolls={rolls}
                                    onReroll={handleReroll}
                                    onRerollThis={handleRerollThisRecord}
                                    onDelete={handleDeleteRoll}
                                    isRolling={isRolling}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
