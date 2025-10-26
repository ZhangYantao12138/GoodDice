'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dice6, Users, Sparkles } from 'lucide-react'
import { generateRoomId } from '@/lib/utils'
import { storage } from '@/lib/utils'

export default function HomePage() {
    const [nickname, setNickname] = useState('')
    const [roomCode, setRoomCode] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // 从本地存储获取昵称，如果没有则使用默认昵称
        const savedNickname = storage.get('nickname')
        if (savedNickname) {
            setNickname(savedNickname)
        } else {
            setNickname('Seal')
        }
    }, [])

    const handleCreateRoom = async () => {
        if (!nickname.trim()) {
            alert('请输入昵称')
            return
        }

        setIsLoading(true)
        try {
            // 保存昵称到本地存储
            storage.set('nickname', nickname.trim())

            // 生成房间ID并跳转
            const roomId = generateRoomId()
            router.push(`/room/${roomId}`)
        } catch (error) {
            console.error('创建房间失败:', error)
            alert('创建房间失败，请重试')
        } finally {
            setIsLoading(false)
        }
    }

    const handleJoinRoom = () => {
        if (!nickname.trim()) {
            alert('请输入昵称')
            return
        }
        if (!roomCode.trim()) {
            alert('请输入房间码')
            return
        }

        // 保存昵称到本地存储
        storage.set('nickname', nickname.trim())

        // 跳转到房间
        router.push(`/room/${roomCode.trim().toUpperCase()}`)
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            {/* 背景装饰 */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo 和标题 */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center mb-6">
                        <div className="glass p-4 rounded-2xl">
                            <div className="text-6xl">🦭</div>
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">海豹骰子</h1>
                    <p className="text-white/70 text-lg">海豹跑团文具集-多人在线骰子</p>
                </div>

                {/* 主卡片 */}
                <div className="card-glass">
                    {/* 昵称输入 */}
                    <div className="mb-6">
                        <label className="block text-white/90 text-sm font-medium mb-2">
                            你的昵称
                        </label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="输入你的昵称"
                            className="input-glass w-full px-4 py-3 rounded-xl"
                            maxLength={20}
                        />
                    </div>

                    {/* 创建房间按钮 */}
                    <button
                        onClick={handleCreateRoom}
                        disabled={isLoading}
                        className="btn-primary w-full mb-4 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                创建新房间
                            </>
                        )}
                    </button>

                    {/* 分割线 */}
                    <div className="flex items-center my-6">
                        <div className="flex-1 h-px bg-white/20"></div>
                        <span className="px-4 text-white/50 text-sm">或</span>
                        <div className="flex-1 h-px bg-white/20"></div>
                    </div>

                    {/* 加入房间 */}
                    <div className="mb-4">
                        <label className="block text-white/90 text-sm font-medium mb-2">
                            房间码
                        </label>
                        <input
                            type="text"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                            placeholder="输入房间码"
                            className="input-glass w-full px-4 py-3 rounded-xl mb-4"
                            maxLength={6}
                        />
                        <button
                            onClick={handleJoinRoom}
                            className="btn-secondary w-full flex items-center justify-center gap-2"
                        >
                            <Users className="w-5 h-5" />
                            加入房间
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-white/50 text-sm">
                    <p>© 2025 海豹跑团 v1.0</p>
                    <p className="mt-1">祝你好运！</p>
                </div>
            </div>
        </div>
    )
}
