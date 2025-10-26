'use client'

import { useRouter } from 'next/navigation'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
    const router = useRouter()

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {/* 背景装饰 */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 text-center">
                <div className="card-glass p-12 max-w-md">
                    <div className="text-6xl mb-6">🎲</div>
                    <h1 className="text-3xl font-bold text-white mb-4">房间不存在</h1>
                    <p className="text-white/70 mb-8">
                        房间不存在或已被删除。<br />
                        请检查房间码是否正确。
                    </p>

                    <div className="flex gap-4">
                        <button
                            onClick={() => router.push('/')}
                            className="btn-primary flex items-center gap-2 flex-1"
                        >
                            <Home className="w-5 h-5" />
                            返回主页
                        </button>
                        <button
                            onClick={() => router.back()}
                            className="btn-secondary flex items-center gap-2 flex-1"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            返回上页
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
