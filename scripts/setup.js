#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🎲 GoodDice 项目设置脚本')
console.log('========================')

// 检查是否存在 .env.local
const envPath = path.join(process.cwd(), '.env.local')
if (!fs.existsSync(envPath)) {
    console.log('📝 创建 .env.local 文件...')
    const envContent = `# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key`

    fs.writeFileSync(envPath, envContent)
    console.log('✅ .env.local 文件已创建')
    console.log('⚠️  请编辑 .env.local 文件，填入你的 Supabase 配置')
} else {
    console.log('✅ .env.local 文件已存在')
}

console.log('\n📋 接下来的步骤：')
console.log('1. 在 Supabase 创建新项目')
console.log('2. 运行 supabase-setup.sql 脚本')
console.log('3. 更新 .env.local 中的配置')
console.log('4. 运行 npm run dev 启动开发服务器')
console.log('\n🎉 设置完成！')
