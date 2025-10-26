'use client'

import { useState } from 'react'
import { Users, Edit2, Check, X } from 'lucide-react'

interface Member {
    id: string
    name: string
    isOnline: boolean
    lastSeen: string
}

interface MemberListProps {
    members: Member[]
    currentUser: string
    onUpdateNickname: (newNickname: string) => void
}

export default function MemberList({ members, currentUser, onUpdateNickname }: MemberListProps) {
    const [editingNickname, setEditingNickname] = useState(false)
    const [newNickname, setNewNickname] = useState(currentUser)

    const handleSaveNickname = () => {
        if (newNickname.trim() && newNickname.trim() !== currentUser) {
            onUpdateNickname(newNickname.trim())
        }
        setEditingNickname(false)
    }

    const handleCancelEdit = () => {
        setNewNickname(currentUser)
        setEditingNickname(false)
    }

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-6 h-6" />
                成员列表 ({members.length})
            </h2>

            <div className="space-y-4 flex-1 overflow-y-auto scrollbar-hide">
                {members.map((member) => (
                    <div
                        key={member.id}
                        className="flex items-center justify-between p-3 glass rounded-xl"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${member.isOnline ? 'bg-green-400' : 'bg-gray-400'
                                }`}></div>
                            <div>
                                {member.name === currentUser && editingNickname ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={newNickname}
                                            onChange={(e) => setNewNickname(e.target.value)}
                                            className="input-glass px-2 py-1 text-sm rounded"
                                            maxLength={20}
                                            autoFocus
                                        />
                                        <button
                                            onClick={handleSaveNickname}
                                            className="text-green-400 hover:text-green-300"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-medium">
                                            {member.name}
                                            {member.name === currentUser && ' (你)'}
                                        </span>
                                        {member.name === currentUser && (
                                            <button
                                                onClick={() => setEditingNickname(true)}
                                                className="text-white/50 hover:text-white"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                )}
                                <p className="text-white/50 text-xs">
                                    {member.isOnline ? '在线' : '离线'}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
