import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs)
}

// 生成随机房间ID
export function generateRoomId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

// 掷骰子函数
export function rollDice(diceType: number, count: number): { results: number[], total: number } {
    const results: number[] = []
    let total = 0

    for (let i = 0; i < count; i++) {
        const roll = Math.floor(Math.random() * diceType) + 1
        results.push(roll)
        total += roll
    }

    return { results, total }
}

// 获取骰子类型显示名称
export function getDiceTypeName(diceType: number): string {
    return `d${diceType}`
}

// 获取骰子表情符号
export function getDiceEmoji(diceType: number): string {
    const emojiMap: { [key: number]: string } = {
        4: '🔺',
        6: '🎲',
        8: '🎯',
        10: '🔟',
        12: '⏰',
        20: '🎲',
        100: '💯'
    }
    return emojiMap[diceType] || '🎲'
}

// 格式化时间
export function formatTime(date: string): string {
    return new Date(date).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    })
}

// 本地存储工具
export const storage = {
    get: (key: string) => {
        if (typeof window === 'undefined') return null
        return localStorage.getItem(key)
    },
    set: (key: string, value: string) => {
        if (typeof window === 'undefined') return
        localStorage.setItem(key, value)
    },
    remove: (key: string) => {
        if (typeof window === 'undefined') return
        localStorage.removeItem(key)
    }
}
