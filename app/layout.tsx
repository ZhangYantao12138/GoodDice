import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'GoodDice - 多人实时掷骰',
    description: '与朋友一起在线掷骰子，实时同步结果',
    keywords: '掷骰子, 在线游戏, 多人游戏, 实时同步',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="zh-CN">
            <body className={inter.className}>
                {children}
            </body>
        </html>
    )
}
