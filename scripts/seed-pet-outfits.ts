import prisma from '../lib/prisma'

// ペット衣装のシードデータ — カテゴリに適した絵文字を厳選
const petOutfits = [
    // === 帽子 (hat) — 頭にかぶるもの ===
    { name: 'ミニリボン', category: 'hat', emoji: '🎀', rarity: 'common', price: 30, unlockLevel: 1, description: 'かわいいリボン。初めての着せ替えに。' },
    { name: 'とんがり帽子', category: 'hat', emoji: '🔮', rarity: 'common', price: 40, unlockLevel: 1, description: '魔法使いみたいなとんがり帽子。' },
    { name: '麦わら帽子', category: 'hat', emoji: '👒', rarity: 'uncommon', price: 80, unlockLevel: 3, description: '夏にぴったり！お散歩用の帽子。' },
    { name: '王冠', category: 'hat', emoji: '👑', rarity: 'rare', price: 200, unlockLevel: 5, description: '小さな王様になれる黄金の冠。' },
    { name: 'パーティーハット', category: 'hat', emoji: '🎉', rarity: 'uncommon', price: 60, unlockLevel: 2, description: 'お祝いの日にぴったり！' },
    { name: 'カウボーイハット', category: 'hat', emoji: '🤠', rarity: 'uncommon', price: 90, unlockLevel: 3, description: 'ワイルドにキメよう！' },
    { name: 'ナイトヘルム', category: 'hat', emoji: '🛡️', rarity: 'epic', price: 350, unlockLevel: 8, description: '伝説の騎士の兜。守護の力が宿る。' },
    { name: '天使の輪', category: 'hat', emoji: '✨', rarity: 'legendary', price: 500, unlockLevel: 10, description: '天使のような輝き。特別な存在に。' },

    // === 服 (clothes) — 体に着るもの ===
    { name: 'ストライプTシャツ', category: 'clothes', emoji: '👕', rarity: 'common', price: 30, unlockLevel: 1, description: 'カジュアルなストライプ柄。' },
    { name: 'セーラー服', category: 'clothes', emoji: '⚓', rarity: 'uncommon', price: 80, unlockLevel: 2, description: '海の冒険者スタイル！' },
    { name: 'タキシード', category: 'clothes', emoji: '🎩', rarity: 'rare', price: 180, unlockLevel: 5, description: '正装でキリッと決めよう。' },
    { name: '忍者装束', category: 'clothes', emoji: '🥷', rarity: 'rare', price: 200, unlockLevel: 5, description: '影に潜む忍者スタイル！' },
    { name: 'パジャマ', category: 'clothes', emoji: '🌙', rarity: 'common', price: 25, unlockLevel: 1, description: 'ふわふわのパジャマ。おやすみ用。' },
    { name: 'スーパーヒーロー', category: 'clothes', emoji: '⭐', rarity: 'epic', price: 300, unlockLevel: 7, description: 'マントを羽織ってヒーローに変身！' },
    { name: '宇宙服', category: 'clothes', emoji: '🚀', rarity: 'legendary', price: 500, unlockLevel: 10, description: '宇宙を旅するための特別な装備。' },
    { name: 'レインコート', category: 'clothes', emoji: '☔', rarity: 'common', price: 35, unlockLevel: 1, description: '雨の日も元気にお出かけ！' },

    // === アクセサリー (accessory) — 持ち物・装飾品 ===
    { name: 'ハートサングラス', category: 'accessory', emoji: '💖', rarity: 'common', price: 25, unlockLevel: 1, description: 'キュートなハート型サングラス。' },
    { name: 'スカーフ', category: 'accessory', emoji: '🧣', rarity: 'common', price: 30, unlockLevel: 1, description: 'ふわふわのスカーフであったか。' },
    { name: '蝶ネクタイ', category: 'accessory', emoji: '🎀', rarity: 'uncommon', price: 60, unlockLevel: 2, description: 'おしゃれ度アップ！' },
    { name: '魔法のステッキ', category: 'accessory', emoji: '🪄', rarity: 'rare', price: 200, unlockLevel: 5, description: '不思議な力が込められたステッキ。' },
    { name: '花かんむり', category: 'accessory', emoji: '🌸', rarity: 'uncommon', price: 70, unlockLevel: 3, description: '花いっぱいのかんむり。春の装い。' },
    { name: 'ギター', category: 'accessory', emoji: '🎸', rarity: 'rare', price: 150, unlockLevel: 4, description: 'ロックな気分でかき鳴らせ！' },
    { name: '虹のマント', category: 'accessory', emoji: '🌈', rarity: 'epic', price: 350, unlockLevel: 8, description: '七色に輝くマジカルマント。' },
    { name: '流れ星のペンダント', category: 'accessory', emoji: '💫', rarity: 'legendary', price: 500, unlockLevel: 10, description: '願いを込めた流れ星のペンダント。' },
]

async function seedPetOutfits() {
    console.log('🎭 Seeding pet outfits (update mode)...')

    let created = 0
    let updated = 0

    for (const outfit of petOutfits) {
        const existing = await prisma.petOutfit.findFirst({
            where: { name: outfit.name }
        })

        if (existing) {
            // Update emoji if changed
            if (existing.emoji !== outfit.emoji || existing.category !== outfit.category) {
                await prisma.petOutfit.update({
                    where: { id: existing.id },
                    data: { emoji: outfit.emoji, category: outfit.category }
                })
                updated++
                console.log(`  📝 Updated: ${outfit.name} (${existing.emoji} → ${outfit.emoji})`)
            }
            continue
        }

        await prisma.petOutfit.create({ data: outfit })
        created++
    }

    console.log(`✅ Done! Created: ${created}, Updated: ${updated}`)
    console.log(`📦 Total outfits in DB: ${await prisma.petOutfit.count()}`)
}

seedPetOutfits()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
