'use client'

import { useState } from 'react'
import { type Roll } from '@/lib/supabase'
import { formatTime } from '@/lib/utils'
import { RotateCcw, Trash2, Copy } from 'lucide-react'

interface RollHistoryProps {
    rolls: Roll[]
    onReroll: (roll: Roll) => void
    onRerollThis: (roll: Roll) => void
    onDelete: (roll: Roll) => void
    isRolling: boolean
}

export default function RollHistory({ rolls, onReroll, onRerollThis, onDelete, isRolling }: RollHistoryProps) {
    const [expandedRoll, setExpandedRoll] = useState<string | null>(null)

    return (
        <div className="h-full flex flex-col">
            {rolls.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-6xl mb-4">🎲</div>
                        <p className="text-white/50">还没有掷骰记录</p>
                        <p className="text-white/30 text-sm mt-1">开始掷骰吧！</p>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    <div className="space-y-4 p-1">
                        {rolls.map((roll) => (
                            <div
                                key={roll.id}
                                className={`glass rounded-xl p-4 animate-fade-in cursor-pointer transition-all duration-200 ${expandedRoll === roll.id
                                    ? 'bg-white/20 border border-white/30'
                                    : 'hover:bg-white/10'
                                    }`}
                                onClick={() => {
                                    // 如果点击的是当前展开的条目，则收起；否则展开当前条目
                                    if (expandedRoll === roll.id) {
                                        setExpandedRoll(null)
                                    } else {
                                        setExpandedRoll(roll.id)
                                    }
                                }}
                            >
                                {/* 主要信息区域 */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                            {roll.user_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium text-lg">{roll.user_name}</p>
                                            <p className="text-white/50 text-sm">{formatTime(roll.created_at)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="text-white font-bold text-2xl">{roll.total}</p>
                                            <p className="text-white/50 text-sm">
                                                {roll.dice_count} × {roll.dice_type}
                                            </p>
                                            {roll.result_display_mode === 'statistics' && roll.statistics_target && (
                                                <p className="text-white/40 text-xs">
                                                    统计 {roll.statistics_target} 出现次数
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-white/30 text-xs">
                                            {expandedRoll === roll.id ? '▼' : '▶'}
                                        </div>
                                    </div>
                                </div>

                                {/* 骰子结果 */}
                                <div className="flex items-center gap-2 flex-wrap mt-3">
                                    {roll.results.map((result, index) => (
                                        <div
                                            key={index}
                                            className="dice-result animate-roll"
                                            style={{ animationDelay: `${index * 0.1}s` }}
                                        >
                                            {result}
                                        </div>
                                    ))}
                                </div>

                                {/* 展开的操作区域 */}
                                {expandedRoll === roll.id && (
                                    <div className="mt-4 pt-4 border-t border-white/20 animate-slide-up">
                                        <div className="flex gap-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onReroll(roll)
                                                }}
                                                disabled={isRolling}
                                                className="btn-primary flex items-center gap-2 flex-1"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                                再投一次
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onRerollThis(roll)
                                                }}
                                                disabled={isRolling}
                                                className="btn-secondary flex items-center gap-2 flex-1"
                                            >
                                                <Copy className="w-4 h-4" />
                                                重投此条
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onDelete(roll)
                                                }}
                                                disabled={isRolling}
                                                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                删除
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
